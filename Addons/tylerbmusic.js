//滑行道灯光
(function() {
    'use strict';
    window.twLights = [];
    window.twPos = [];
    window.currLight;
    window.errs = 0;
    /*if (localStorage.getItem("twLEnabled") == null) {
        localStorage.setItem("twLEnabled", 'true');
    }
    if (localStorage.getItem("twLRenderDist") == null) {
        localStorage.setItem("twLRenderDist", '0.05');
    }
    if (localStorage.getItem("twLUpdateInterval") == null) {
        localStorage.setItem("twLUpdateInterval", "5");
    }
    if (localStorage.getItem("twLGSize") == null) {
        localStorage.setItem("twLGSize", "0.05");
    }
    if (localStorage.getItem("twLBSize") == null) {
        localStorage.setItem('twLBSize', "0.07");
    }*/
    if (!window.gmenu || !window.GMenu) {
        console.log("Taxiway Lights getting GMenu");
        fetch('https://raw.githubusercontent.com/tylerbmusic/GeoFS-Addon-Menu/refs/heads/main/addonMenu.js')
            .then(response => response.text())
            .then(script => {eval(script);})
        .then(() => {setTimeout(afterGMenu, 100);});
    }
    function afterGMenu() {
        const twLM = new window.GMenu("Taxiway Lights", "twL");
        twLM.addItem("Render distance (degrees): ", "RenderDist", "number", 0, '0.05');
        twLM.addItem("Update Interval (seconds): ", "UpdateInterval", "number", 0, '5');
        twLM.addItem("Green/Yellow Light Size: ", "GSize", "number", 0, "0.05");
        twLM.addItem("Blue Light Size: ", "BSize", "number", 0, "0.07");
        console.log("TwL Enabled? " + localStorage.getItem("twLEnabled"));
        setTimeout(() => {window.updateLights();}, 100*Number(localStorage.getItem("twLUpdateInterval")));
    }
})();

window.updateLights = async function() {
    if (window.geofs.cautiousWithTerrain == false && (localStorage.getItem("twLEnabled") == 'true')) { //timeRatio is basically how bright the terrain should be--at noon it's 0, at midnight it's 1
        var renderDistance = Number(localStorage.getItem("twLRenderDist")); //Render distance, in degrees.
        var l0 = Math.floor(window.geofs.aircraft.instance.llaLocation[0]/renderDistance)*renderDistance;
        var l1 = Math.floor(window.geofs.aircraft.instance.llaLocation[1]/renderDistance)*renderDistance;
        var bounds = (l0) + ", " + (l1) + ", " + (l0+renderDistance) + ", " + (l1+renderDistance);
        if (!window.lastBounds || (window.lastBounds != bounds)) {
            //Remove existing lights
            for (let i = 0; i < window.twLights.length; i++) {
                window.geofs.api.viewer.entities.remove(window.twLights[i]);
            }
            window.twLights = [];
            console.log("Lights removed, placing taxiway edge lights");
            //Place new lights
            window.getTwD(bounds); //getTaxiwayData
            console.log("Placing taxiway centerline lights");
            window.getTwDE(bounds); //getTaxiwayDataEdgeless
            //setTimeout(() => {window.removeCloseTwLights();}, 6000);
        }
        window.lastBounds = bounds;
    } else if ((localStorage.getItem("twLEnabled") != 'true')) {
        window.lastBounds = "";
        for (let i = 0; i < window.twLights.length; i++) {
            window.geofs.api.viewer.entities.remove(window.twLights[i]);
        }
        window.twLights = [];
        //console.log("It's either daytime or the taxiway lights aren't enabled, lights are off");
    }
    setTimeout(() => {window.updateLights();}, 1000*Number(localStorage.getItem("twLUpdateInterval")));
}

function calculateBearing(lon1, lat1, lon2, lat2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
          Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
}

// Function to calculate the offset points based on the bearing.
function calculateOffsetPoint(lon, lat, bearing, offsetDistance) {
    const R = 6378137; // Earth's radius in meters

    // Convert bearing to radians
    const bearingRad = (bearing + 90) * Math.PI / 180; // +90 to make it perpendicular

    // Calculate offset in radians
    const dLat = offsetDistance * Math.cos(bearingRad) / R;
    const dLon = offsetDistance * Math.sin(bearingRad) / (R * Math.cos(Math.PI * lat / 180));

    return {
        lonPlus: lon + dLon * 180 / Math.PI,
        latPlus: lat + dLat * 180 / Math.PI,
        lonMinus: lon - dLon * 180 / Math.PI,
        latMinus: lat - dLat * 180 / Math.PI
    };
}

function interpolatePoints(start, end, interval) {
    const [lon1, lat1] = start;
    const [lon2, lat2] = end;

    const distance = Math.sqrt(
        Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2)
    );

    const numPoints = Math.max(Math.floor(distance / interval), 1);
    const interpolated = [];

    for (let i = 0; i <= numPoints; i++) {
        const ratio = i / numPoints;
        const lon = lon1 + (lon2 - lon1) * ratio;
        const lat = lat1 + (lat2 - lat1) * ratio;
        interpolated.push([lon, lat, 0]);
    }

    return interpolated;
}

async function getTaxiwayData(bounds) {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
        [out:json];
        (
            way["aeroway"="taxiway"]({{bbox}});
        );
        out body;
        >;
        out skel qt;
    `;
    const bbox = bounds;

    try {
        const response = await fetch(`${overpassUrl}?data=${encodeURIComponent(query.replace('{{bbox}}', bbox))}`);
        const data = await response.json();

        const taxiwayEdges = [];
        const nodes = {};

        data.elements.forEach(element => {
            if (element.type === 'node') {
                nodes[element.id] = element;
            }
        });

        data.elements.forEach(element => {
            if (element.type === 'way') {
                const wayNodes = element.nodes.map(nodeId => {
                    const node = nodes[nodeId];
                    if (node) {
                        return [node.lon, node.lat, 0];
                    }
                }).filter(Boolean);

                if (wayNodes.length > 1) {
                    const edgePoints = [];
                    const interval = 0.0002 + ((Math.random()-0.5)*0.00005); // Adjust for desired spacing

                    for (let i = 0; i < wayNodes.length - 1; i++) {
                        const segmentPoints = interpolatePoints(wayNodes[i], wayNodes[i + 1], interval);
                        const bearing = calculateBearing(
                            wayNodes[i][0], wayNodes[i][1],
                            wayNodes[i + 1][0], wayNodes[i + 1][1]
                        );

                        // Calculate edge points for each interpolated point
                        const offset = 10; // 10 meters from centerline
                        const interpolatedEdgePoints = segmentPoints.map(([lon, lat, alt]) => {
                            const offsetPoints = calculateOffsetPoint(lon, lat, bearing, offset);
                            return [
                                [offsetPoints.lonPlus, offsetPoints.latPlus, alt],
                                [offsetPoints.lonMinus, offsetPoints.latMinus, alt]
                            ];
                        });

                        edgePoints.push(...interpolatedEdgePoints);
                    }

                    taxiwayEdges.push(edgePoints);
                }
            }
        });

        return taxiwayEdges;
    } catch (error) {
        console.error('Error fetching taxiway data:', error);
    }
}

///
async function getTaxiwayDataEdgeless(bounds) {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
        [out:json];
        (
            way["aeroway"="taxiway"]({{bbox}});
        );
        out body;
        >;
        out skel qt;
    `;
    const bbox = bounds;

    try {
        const response = await fetch(`${overpassUrl}?data=${encodeURIComponent(query.replace('{{bbox}}', bbox))}`);
        const data = await response.json();

        const centerlinePoints = [];
        const nodes = {};

        data.elements.forEach(element => {
            if (element.type === 'node') {
                nodes[element.id] = element;
            }
        });

        data.elements.forEach(element => {
            if (element.type === 'way') {
                const wayNodes = element.nodes.map(nodeId => {
                    const node = nodes[nodeId];
                    if (node) {
                        return [node.lon, node.lat, 0];
                    }
                }).filter(Boolean);

                if (wayNodes.length > 1) {
                    const interval = 0.00007 + ((Math.random()-0.5)*0.00002); // Semi-random spacing

                    for (let i = 0; i < wayNodes.length - 1; i++) {
                        const segmentPoints = interpolatePoints(wayNodes[i], wayNodes[i + 1], interval);
                        centerlinePoints.push(...segmentPoints);
                    }
                }
            }
        });

        return centerlinePoints;
    } catch (error) {
        console.error('Error fetching taxiway data:', error);
    }
}
window.getTwD = async function(bounds) {
    getTaxiwayData(bounds).then(edges => {
        edges.forEach(edge => {
            edge.forEach(([plus, minus]) => {
                [plus, minus].forEach(epos => {
                    const apos = window.geofs.getGroundAltitude([epos[1], epos[0], epos[2]]).location;
                    apos[2] += 0.3556; //Offset 14 inches from the ground
                    const pos = window.Cesium.Cartesian3.fromDegrees(apos[1], apos[0], apos[2]);
                    if (pos[2] < 0) {
                        window.errs++;
                        pos[2] = 0 - pos[2];
                    }
                    window.twLights.push(
                        window.geofs.api.viewer.entities.add({
                            position: pos,
                            billboard: {
                                image: "https://tylerbmusic.github.io/GPWS-files_geofs/bluelight.png",
                                scale: Number(localStorage.getItem("twLBSize")) * (1 / window.geofs.api.renderingSettings.resolutionScale),
                                scaleByDistance: { //May or may not work
                                    "near": 1,
                                    "nearValue": 0.5,
                                    "far": 1500,
                                    "farValue": 0.15
                                },
                                translucencyByDistance: new window.Cesium.NearFarScalar(10, 1.0, 10e3, 0.0)
                            },
                        })
                    );
                });
            });
        });
    });
};
/*function checkProximityToRunway(pos) { //Where pos = [longitude, latitude] or [longitude, latitude, altitude]
    window.conTestPos = pos;
    var l0 = window.geofs.runways.getNearestRunway([pos[1], pos[0], 10]).threshold1;
    var l1 = window.geofs.runways.getNearestRunway([pos[1], pos[0], 10]).threshold2;
    if (!window.pLoc) {
        window.pLoc = interpolatePoints([l0[1], l0[0]], [l1[1], l1[0]], 5/111000);
    }
    var dist = 20/111000;
    for (var i = 0; i < window.pLoc.length; i++) {
        if ((Math.abs(window.pLoc[i][0]-pos[0]) < dist) && (Math.abs(window.pLoc[i][1]-pos[1]) < dist)) {
            return true;
        }
    }
    return false;
}*/

///
function checkProximityToRunway(pos) {
    // Retrieve and cache nearest runway if not already cached
    if (!window.runwayThresholds) {
        window.runwayThresholds = [];
        for (var i in window.geofs.runways.nearRunways) {
            const nearestRunway = window.geofs.runways.nearRunways[i];
            const l0 = nearestRunway.threshold1;
            const l1 = nearestRunway.threshold2;
            window.runwayThresholds.push(interpolatePoints([l0[1], l0[0]], [l1[1], l1[0]], 5 / 111000));
        }
    }

    const distSquared = (40 / 111000) ** 2; // Square distance to avoid sqrt calculations
    const posLon = pos[0];
    const posLat = pos[1];

    // Check if any point along the runway centerline is within the set proximity distance
    for (var v in window.runwayThresholds) {
        if (window.runwayThresholds[v].some(([lon, lat]) => {
            const deltaLon = lon - posLon;
            const deltaLat = lat - posLat;
            return deltaLon ** 2 + deltaLat ** 2 < distSquared;
        })) {
            return true; // Return true if any point is within proximity
        }
    }
    return false; // Return false if no points were close enough
}
///

window.getTwDE = async function(bounds) {
    getTaxiwayDataEdgeless(bounds).then(centerline => {
        var z = 0;
        centerline.forEach(epos => {
            z++;
            const apos = window.geofs.getGroundAltitude([epos[1], epos[0], epos[2]]).location;
            apos[2] += 0.3556; //Offset 14 inches from the ground
            const pos = window.Cesium.Cartesian3.fromDegrees(apos[1], apos[0], apos[2]);

            // Calculate distance to runway and set light color accordingly
            const isNearRunway = checkProximityToRunway(epos); // Calculate proximity
            const lightImage = (z%2 == 0 && isNearRunway) ?
                  "https://tylerbmusic.github.io/GPWS-files_geofs/yellowlight.png" :
            "https://tylerbmusic.github.io/GPWS-files_geofs/greenlight.png";

            if (pos[2] < 0) {
                window.errs++;
                pos[2] = 0 - pos[2];
            }
            window.twPos.push([pos, window.twLights.length]);
            window.twLights.push(
                window.geofs.api.viewer.entities.add({
                    position: pos,
                    billboard: {
                        image: lightImage,
                        scale: Number(localStorage.getItem("twLGSize")) * (1 / window.geofs.api.renderingSettings.resolutionScale),
                        scaleByDistance: {
                            "near": 1,
                            "nearValue": 1,
                            "far": 2000,
                            "farValue": 0.15
                        },
                        translucencyByDistance: new window.Cesium.NearFarScalar(10, 1.0, 10e3, 0.0)
                    },
                })
            );
        });
    });
};

window.removeCloseTwLights = function() {
    const grid = {};
    const gridSize = 2; // Cell size in meters, matches the distance threshold
    const indicesToRemove = new Set();

    // Helper function to compute grid cell based on coordinates
    const getGridKey = (x, y) => `${Math.floor(x / gridSize)}_${Math.floor(y / gridSize)}`;

    // Populate the grid with taxiway light positions
    for (let i = 0; i < window.twPos.length; i++) {
        const pos = window.twPos[i][0];
        const gridKey = getGridKey(pos.x, pos.y);

        if (!grid[gridKey]) grid[gridKey] = [];
        grid[gridKey].push(i);
    }

    // Check for close taxiway lights within each cell and neighboring cells
    for (const key in grid) {
        const [xKey, yKey] = key.split('_').map(Number);
        const cellsToCheck = [
            `${xKey}_${yKey}`,
            `${xKey + 1}_${yKey}`, `${xKey - 1}_${yKey}`,
            `${xKey}_${yKey + 1}`, `${xKey}_${yKey - 1}`,
            `${xKey + 1}_${yKey + 1}`, `${xKey - 1}_${yKey - 1}`,
            `${xKey + 1}_${yKey - 1}`, `${xKey - 1}_${yKey + 1}`
        ];

        for (const cell of cellsToCheck) {
            if (!grid[cell]) continue;

            for (let i = 0; i < grid[key].length; i++) {
                const idx1 = grid[key][i];
                const pos1 = window.twPos[idx1][0];

                for (const idx2 of grid[cell]) {
                    if (idx1 >= idx2 || indicesToRemove.has(idx2)) continue;

                    const pos2 = window.twPos[idx2][0];
                    if (Math.abs(pos1.x - pos2.x) <= 3 && Math.abs(pos1.y - pos2.y) <= 3) {
                        indicesToRemove.add(idx2);
                    }
                }
            }
        }
    }

    // Remove marked taxiway lights
    const sortedIndices = Array.from(indicesToRemove).sort((a, b) => b - a);
    for (const index of sortedIndices) {
        window.geofs.api.viewer.entities.remove(window.twLights[index]);
        window.twPos.splice(index, 1);
        window.twLights.splice(index, 1);
    }

    console.log(`${sortedIndices.length} taxiway lights removed.`);
};





//GPWS
setTimeout((function() {
    'use strict';
    window.soundsToggleKey = "w"; //CHANGE THIS LETTER TO CHANGE THE KEYBOARD SHORTCUT TO TOGGLE THE SOUNDS.
    window.soundsOn = true; //This decides whether callouts are on by default or off by default.
    window.a2500 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/2500.wav');
    window.a2000 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/2000.wav');
    window.a1000 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/1000.wav');
    window.a500 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/500.wav');
    window.a400 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/400.wav');
    window.a300 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/300.wav');
    window.a200 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/200.wav');
    window.a100 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/100.wav');
    window.a50 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/50.wav');
    window.a40 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/40.wav');
    window.a30 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/30.wav');
    window.a20 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/20.wav');
    window.a10 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/10.wav');
    window.aRetard = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/retard.wav');
    window.a5 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/5.wav');
    window.stall = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/stall.wav');
    window.glideSlope = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/glideslope.wav');
    window.tooLowFlaps = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/too-low_flaps.wav');
    window.tooLowGear = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/too-low_gear.wav');
    window.apDisconnect = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/ap-disconnect.wav');
    window.minimumBaro = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/minimum.wav');
    window.dontSink = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/dont-sink.wav');
    window.masterA = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/masterAlarm.wav');
    window.bankAngle = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bank-angle.wav');
    window.overspeed = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/overspeed.wav');
    window.justPaused = false;
    window.masterA.loop = true;
    window.bankAngle.loop = true;
    window.overspeed.loop = true;
    window.iminimums = false;
    window.i2500 = false;
    window.i2000 = false;
    window.i1000 = false;
    window.i500 = false;
    window.i400 = false;
    window.i300 = false;
    window.i200 = false;
    window.i100 = false;
    window.i50 = false;
    window.i40 = false;
    window.i30 = false;
    window.i20 = false;
    window.i10 = false;
    window.i7 = false;
    window.i5 = false;
    window.gpwsRefreshRate = 100;
    window.willTheDoorFallOff = false;
    window.didAWheelFall = false;
    function isInRange(i, a, vs) {
        if (i >= 100) {
            if ((i <= a+10) && (i >= a-10)) {
                return true;
            }
        } else if (i >= 10) {
            if ((i < a+4) && (i > a-4)) {
                return true;
            }
        } else {
            if (i <= a+1 && i >= a-1) {
                return true;
            }
        }
        return false;
    }
    window.wasAPOn = false;
    //window.isRadioPanelOpen = false;
    var flightDataElement = document.getElementById('flightDataDisplay1');
    if (!flightDataElement) {
        var bottomDiv = document.getElementsByClassName('geofs-ui-bottom')[0];
        flightDataElement = document.createElement('div');
        flightDataElement.id = 'flightDataDisplay1';
        flightDataElement.classList = 'mdl-button';
        bottomDiv.appendChild(flightDataElement);
    }

    flightDataElement.innerHTML = `
                <input style="background: 0 0; border: none; border-radius: 2px; color: #000; display: inline-block; padding: 0 8px;" placeholder="Minimums (Baro)" id="minimums">
            `;
    function updateGPWS() {
        // Check if geofs.animation.values is available
        if (typeof geofs.animation.values != 'undefined' && !geofs.isPaused()) {
            if (window.justPaused) {
                window.justPaused = false;
            }
            window.willTheDoorFallOff = geofs.aircraft.instance.aircraftRecord.name.includes("Boeing");
            window.isAsOldAsYourMom = geofs.aircraft.instance.aircraftRecord.name.includes("757") || geofs.aircraft.instance.aircraftRecord.name.includes("767");
            if (window.isAsOldAsYourMom && !window.wasAsOldAsYourMom) {
                window.a2500 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b2500.wav');
                window.a2000 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b2000.wav');
                window.a1000 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o1000.wav');
                window.a500 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o500.wav');
                window.a400 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o400.wav');
                window.a300 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o300.wav');
                window.a200 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o200.wav');
                window.a100 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o100.wav');
                window.a50 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o50.wav');
                window.a40 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o40.wav');
                window.a30 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o30.wav');
                window.a20 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o20.wav');
                window.a10 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/o10.wav');
                window.a5 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b5.wav');
                window.stall = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bstall.wav');
                window.glideSlope = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/oglideslope.wav');
                window.tooLowFlaps = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/otoo-low_flaps.wav');
                window.tooLowGear = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/otoo-low_gear.wav');
                window.apDisconnect = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bap-disconnect.wav');
                window.minimumBaro = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/ominimums.wav');
                window.dontSink = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/odont-sink.wav');
                window.masterA = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bmasterAlarm.wav');
                window.bankAngle = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/obank-angle.wav');
                window.overspeed = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/boverspeed.wav');
                window.masterA.loop = true;
                window.bankAngle.loop = true;
                window.overspeed.loop = true;
            } else if (window.willTheDoorFallOff && !window.didAWheelFall && !window.isAsOldAsYourMom) {
                window.a2500 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b2500.wav');
                window.a2000 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b2000.wav');
                window.a1000 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b1000.wav');
                window.a500 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b500.wav');
                window.a400 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b400.wav');
                window.a300 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b300.wav');
                window.a200 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b200.wav');
                window.a100 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b100.wav');
                window.a50 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b50.wav');
                window.a40 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b40.wav');
                window.a30 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b30.wav');
                window.a20 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b20.wav');
                window.a10 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b10.wav');
                window.a5 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/b5.wav');
                window.stall = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bstall.wav');
                window.glideSlope = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bglideslope.wav');
                window.tooLowFlaps = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/btoo-low_flaps.wav');
                window.tooLowGear = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/btoo-low_gear.wav');
                window.apDisconnect = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bap-disconnect.wav');
                window.minimumBaro = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bminimums.wav');
                window.dontSink = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bdont-sink.wav');
                window.masterA = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bmasterAlarm.wav');
                window.bankAngle = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bbank-angle.wav');
                window.overspeed = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/boverspeed.wav');
                window.masterA.loop = true;
                window.bankAngle.loop = true;
                window.overspeed.loop = true;
            } else if (!window.willTheDoorFallOff && window.didAWheelFall) {
                window.a2500 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/2500.wav');
                window.a2000 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/2000.wav');
                window.a1000 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/1000.wav');
                window.a500 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/500.wav');
                window.a400 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/400.wav');
                window.a300 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/300.wav');
                window.a200 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/200.wav');
                window.a100 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/100.wav');
                window.a50 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/50.wav');
                window.a40 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/40.wav');
                window.a30 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/30.wav');
                window.a20 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/20.wav');
                window.a10 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/10.wav');
                window.a5 = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/5.wav');
                window.stall = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/stall.wav');
                window.glideSlope = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/glideslope.wav');
                window.tooLowFlaps = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/too-low_flaps.wav');
                window.tooLowGear = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/too-low_gear.wav');
                window.apDisconnect = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/ap-disconnect.wav');
                window.minimumBaro = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/minimum.wav');
                window.dontSink = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/dont-sink.wav');
                window.masterA = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/masterAlarm.wav');
                window.bankAngle = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/bank-angle.wav');
                window.overspeed = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/overspeed.wav');
                window.masterA.loop = true;
                window.bankAngle.loop = true;
                window.overspeed.loop = true;
            }
            // Retrieve and format the required values
            var minimum = ((document.getElementById("minimums") !== null) && document.getElementById("minimums").value !== undefined) ? Number(document.getElementById("minimums").value) : undefined;
            var agl = (geofs.animation.values.altitude !== undefined && geofs.animation.values.groundElevationFeet !== undefined) ? Math.round((geofs.animation.values.altitude - geofs.animation.values.groundElevationFeet) + (geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2]*3.2808399)) : 'N/A';
            var verticalSpeed = geofs.animation.values.verticalSpeed !== undefined ? Math.round(geofs.animation.values.verticalSpeed) : 'N/A';
            //Glideslope calculation
            var glideslope;
            if (geofs.animation.getValue("NAV1Direction") && (geofs.animation.getValue("NAV1Distance") !== geofs.runways.getNearestRunway([geofs.nav.units.NAV1.navaid.lat,geofs.nav.units.NAV1.navaid.lon,0]).lengthMeters*0.185)) { //The second part to the if statement prevents the divide by 0 error.
                glideslope = (geofs.animation.getValue("NAV1Direction") === "to") ? Number((Math.atan(((geofs.animation.values.altitude/3.2808399+(geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2]+0.1))-geofs.nav.units.NAV1.navaid.elevation) / (geofs.animation.getValue("NAV1Distance")+geofs.runways.getNearestRunway([geofs.nav.units.NAV1.navaid.lat,geofs.nav.units.NAV1.navaid.lon,0]).lengthMeters*0.185))*RAD_TO_DEGREES).toFixed(1)) : Number((Math.atan(((geofs.animation.values.altitude/3.2808399+(geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2]+0.1))-geofs.nav.units.NAV1.navaid.elevation) / Math.abs(geofs.animation.getValue("NAV1Distance")-geofs.runways.getNearestRunway([geofs.nav.units.NAV1.navaid.lat,geofs.nav.units.NAV1.navaid.lon,0]).lengthMeters*0.185))*RAD_TO_DEGREES).toFixed(1));
            } else {
                glideslope = undefined;
            } //End Glideslope calculation
            if (audio.on && window.soundsOn) {
                if (((geofs.aircraft.instance.stalling && !geofs.aircraft.instance.groundContact) || (geofs.nav.units.NAV1.navaid !== null && (agl > 100 && (glideslope < (geofs.nav.units.NAV1.navaid.slope - 1.5) || (glideslope > geofs.nav.units.NAV1.navaid.slope + 2)))) || (!geofs.aircraft.instance.groundContact && agl < 300 && (geofs.aircraft.instance.definition.gearTravelTime !== undefined) && (geofs.animation.values.gearPosition >= 0.5)) || (!geofs.aircraft.instance.groundContact && agl < 500 && (geofs.animation.values.flapsSteps !== undefined) && (geofs.animation.values.flapsPosition == 0) && window.tooLowGear.paused) || (!geofs.aircraft.instance.groundContact && agl < 300 && geofs.animation.values.throttle > 0.95 && verticalSpeed <= 0) || (Math.abs(geofs.aircraft.instance.animationValue.aroll) > 45)) && window.masterA.paused) {
                    window.masterA.play();
                } else if (!((geofs.aircraft.instance.stalling && !geofs.aircraft.instance.groundContact) || (geofs.nav.units.NAV1.navaid !== null && (agl > 100 && (glideslope < (geofs.nav.units.NAV1.navaid.slope - 1.5) || (glideslope > geofs.nav.units.NAV1.navaid.slope + 2)))) || (!geofs.aircraft.instance.groundContact && agl < 300 && (geofs.aircraft.instance.definition.gearTravelTime !== undefined) && (geofs.animation.values.gearPosition >= 0.5)) || (!geofs.aircraft.instance.groundContact && agl < 500 && (geofs.animation.values.flapsSteps !== undefined) && (geofs.animation.values.flapsPosition == 0) && window.tooLowGear.paused) || (!geofs.aircraft.instance.groundContact && agl < 300 && geofs.animation.values.throttle > 0.95 && verticalSpeed <= 0) || (Math.abs(geofs.aircraft.instance.animationValue.aroll) > 45)) && !window.masterA.paused) {
                    window.masterA.pause();
                }
                if (Math.abs(geofs.aircraft.instance.animationValue.aroll) > 45 && window.bankAngle.paused) {
                    window.bankAngle.play();
                } else if (!(Math.abs(geofs.aircraft.instance.animationValue.aroll) > 45) && !window.bankAngle.paused) {
                    window.bankAngle.pause();
                }
                if (geofs.aircraft.instance.stalling && !geofs.aircraft.instance.groundContact && window.stall.paused) { //Stall
                    window.stall.play();
                } else if (!window.stall.paused && !geofs.aircraft.instance.stalling) {
                    window.stall.pause();
                }
                if (geofs.nav.units.NAV1.navaid !== null && (agl > 100 && (glideslope < (geofs.nav.units.NAV1.navaid.slope - 1.5) || (glideslope > geofs.nav.units.NAV1.navaid.slope + 2)) && window.glideSlope.paused)) { //Glideslope
                    window.glideSlope.play();
                }
                if (!geofs.aircraft.instance.groundContact && agl < 300 && (geofs.aircraft.instance.definition.gearTravelTime !== undefined) && (geofs.animation.values.gearPosition >= 0.5) && window.tooLowGear.paused) { //Too Low - Gear (This warning takes priority over the Too Low - Flaps warning)
                    window.tooLowGear.play();
                }
                if (!geofs.aircraft.instance.groundContact && agl < 500 && (geofs.animation.values.flapsSteps !== undefined) && (geofs.animation.values.flapsPosition == 0) && window.tooLowGear.paused && window.tooLowFlaps.paused) { //Too Low - Flaps
                    window.tooLowFlaps.play();
                }
                if (!geofs.autopilot.on && window.wasAPOn) { //Autopilot Disconnect
                    window.apDisconnect.play();
                }
                if (verticalSpeed <= 0) {
                    if (!geofs.aircraft.instance.groundContact && agl < 300 && geofs.animation.values.throttle > 0.95 && window.dontSink.paused) { //Don't Sink
                        window.dontSink.play();
                    }
                    if ((minimum !== undefined) && (geofs.animation.values.altitude+2 > minimum && minimum > geofs.animation.values.altitude-2) && !window.iminimums) { //Minimum
                        window.minimumBaro.play();
                        window.iminimums = true;
                    }
                    if (isInRange(2500, agl) && !window.i2500) { //2,500
                        window.a2500.play();
                        window.i2500 = true;
                    }
                    if (isInRange(2000, agl) && !window.i2000) { //2,000
                        window.a2000.play();
                        window.i2000 = true;
                    }
                    if (isInRange(1000, agl) && !window.i1000) { //1,000
                        window.a1000.play();
                        window.i1000 = true;
                    }
                    if (isInRange(500, agl) && !window.i500) { //500
                        window.a500.play();
                        window.i500 = true;
                    }
                    if (isInRange(400, agl) && !window.i400) { //400
                        window.a400.play();
                        window.i400 = true;
                    }
                    if (isInRange(300, agl) && !window.i300) { //300
                        window.a300.play();
                        window.i300 = true;
                    }
                    if (isInRange(200, agl) && !window.i200) { //200
                        window.a200.play();
                        window.i200 = true;
                    }
                    if (isInRange(100, agl) && !window.i100) { //100
                        window.a100.play();
                        window.i100 = true;
                    }
                    if (isInRange(50, agl) && !window.i50) { //50
                        window.a50.play();
                        window.i50 = true;
                    }
                    if (isInRange(40, agl) && !window.i40) { //40
                        window.a40.play();
                        window.i40 = true;
                    }
                    if (isInRange(30, agl) && !window.i30) { //30
                        window.a30.play();
                        window.i30 = true;
                    }
                    if (isInRange(20, agl) && !window.i20) { //20
                        window.a20.play();
                        window.i20 = true;
                    }
                    if (isInRange(10, agl) && !window.i10) { //10
                        window.a10.play();
                        window.i10 = true;
                    }
                    if (!geofs.aircraft.instance.groundContact && ((agl+(geofs.animation.values.verticalSpeed/60)*2) <= 1.0) && !window.i7) { //Retard 2 seconds from touchdown
                        window.aRetard.play();
                        window.i7 = true;
                    }
                    if (isInRange(5, agl) && !window.i5) { //5
                        window.a5.play();
                        window.i5 = true;
                    }
                    window.gpwsRefreshRate = 30;
                } else if (verticalSpeed > 0) {
                    if (window.iminimums) {
                        window.iminimums = false;
                    }
                    if (window.i2500) {
                        window.i2500 = false;
                    }
                    if (window.i2000) {
                        window.i2000 = false;
                    }
                    if (window.i1000) {
                        window.i1000 = false;
                    }
                    if (window.i500) {
                        window.i500 = false;
                    }
                    if (window.i400) {
                        window.i400 = false;
                    }
                    if (window.i300) {
                        window.i300 = false;
                    }
                    if (window.i200) {
                        window.i200 = false;
                    }
                    if (window.i100) {
                        window.i100 = false;
                    }
                    if (window.i50) {
                        window.i50 = false;
                    }
                    if (window.i40) {
                        window.i40 = false;
                    }
                    if (window.i30) {
                        window.i30 = false;
                    }
                    if (window.i20) {
                        window.i20 = false;
                    }
                    if (window.i10) {
                        window.i10 = false;
                    }
                    if (window.i7) {
                        window.i7 = false;
                    }
                    if (window.i5) {
                        window.i5 = false;
                    }
                    window.gpwsRefreshRate = 100;
                }
            }
        } else if (geofs.isPaused() && !window.justPaused) {
            window.a2500.pause();
            window.a2000.pause();
            window.a1000.pause();
            window.a500.pause();
            window.a400.pause();
            window.a300.pause();
            window.a200.pause();
            window.a100.pause();
            window.a50.pause();
            window.a40.pause();
            window.a30.pause();
            window.a20.pause();
            window.a10.pause();
            window.aRetard.pause();
            window.a5.pause();
            window.stall.pause();
            window.glideSlope.pause();
            window.tooLowFlaps.pause();
            window.tooLowGear.pause();
            window.apDisconnect.pause();
            window.minimumBaro.pause();
            window.dontSink.pause();
            window.masterA.pause();
            window.bankAngle.pause();
            window.overspeed.pause();
            window.justPaused = true;
        }
        window.wasAPOn = geofs.autopilot.on;
        window.didAWheelFall = window.willTheDoorFallOff;
        window.wasAsOldAsYourMom = geofs.aircraft.instance.aircraftRecord.name.includes("757") || geofs.aircraft.instance.aircraftRecord.name.includes("767");
    }

    // Update flight data display every 100ms
    setInterval(updateGPWS, window.gpwsRefreshRate);
    document.addEventListener('keydown', function(event) {
        if (event.key === window.soundsToggleKey) {
            window.soundsOn = !window.soundsOn;
        }
    });
}), 8000);






//着陆统计

setTimeout((function() {
    'use strict';

    window.closeTimer = false; // Set to true if you want a timer to close the landing stats. Set to false if you want to manually close the landing stats.
    window.closeSeconds = 10; // Number of seconds to wait before closing the landing stats.

    window.refreshRate = 20;
    window.counter = 0;
    window.isLoaded = false;

    window.justLanded = false;
    window.vertSpeed = 0;
    window.oldAGL = 0;
    window.newAGL = 0;
    window.calVertS = 0;
    window.groundSpeed = 0;
    window.ktias = 0;
    window.kTrue = 0;
    window.bounces = 0;
    window.statsOpen = false;
    window.isGrounded = true;
    window.isInTDZ = false;

    window.softLanding = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/soft_landing.wav');
    window.hardLanding = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/hard_landing.wav');
    window.crashLanding = new Audio('https://tylerbmusic.github.io/GPWS-files_geofs/crash_landing.wav');

    window.statsDiv = document.createElement('div');
    window.statsDiv.style.width = 'fit-content';
    window.statsDiv.style.height = 'fit-content';
    window.statsDiv.style.background = 'linear-gradient(to bottom right, rgb(29, 52, 87), rgb(20, 40, 70))';
    window.statsDiv.style.zIndex = '100000';
    window.statsDiv.style.margin = '30px';
    window.statsDiv.style.padding = '15px';
    window.statsDiv.style.fontFamily = 'Arial, sans-serif';
    window.statsDiv.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)';
    window.statsDiv.style.color = 'white';
    window.statsDiv.style.position = 'fixed';
    window.statsDiv.style.borderRadius = '12px';
    window.statsDiv.style.left = '-50%';
    window.statsDiv.style.transition = '0.4s ease';
    window.statsDiv.style.border = '1px solid rgba(255,255,255,0.1)';
    document.body.appendChild(window.statsDiv);

    function updateLndgStats() {
        if (geofs.cautiousWithTerrain == false && !geofs.isPaused()) {
            var ldgAGL = (geofs.animation.values.altitude !== undefined && geofs.animation.values.groundElevationFeet !== undefined) ? ((geofs.animation.values.altitude - geofs.animation.values.groundElevationFeet) + (geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2]*3.2808399)) : 'N/A';
            if (ldgAGL < 500) {
                window.justLanded = (geofs.animation.values.groundContact && !window.isGrounded);
                if (window.justLanded && !window.statsOpen) {
                    if (window.closeTimer) {
                        setTimeout(window.closeLndgStats, 1000*window.closeSeconds);
                    }
                    window.statsOpen = true;
                    window.statsDiv.innerHTML = `
                <button style="
                    right: 10px; 
                    top: 10px; 
                    position: absolute; 
                    background: rgba(255,255,255,0.2); 
                    border: none; 
                    color: white; 
                    cursor: pointer; 
                    width: 30px; 
                    height: 30px; 
                    border-radius: 50%; 
                    font-weight: bold;" 
                    onclick="window.closeLndgStats()">✕</button>
                    <style>
                        .info-block {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10px;
                            font-size: 14px;
                        }
                        .landing-quality {
                            grid-column: 1 / -1;
                            text-align: center;
                            font-weight: bold;
                            margin-top: 10px;
                            padding: 5px;
                            border-radius: 5px;
                        }
                    </style>
                    <div class="info-block">
                        <span>Vertical speed: ${window.vertSpeed} fpm</span>
                        <span>G-Forces: ${(geofs.animation.values.accZ/9.80665).toFixed(2)}G</span>
                        <span>Terrain-calibrated V/S: ${window.calVertS.toFixed(1)}</span>
                        <span>True airspeed: ${window.kTrue} kts</span>
                        <span>Ground speed: ${window.groundSpeed.toFixed(1)} kts</span>
                        <span>Indicated speed: ${window.ktias} kts</span>
                        <span>Roll: ${geofs.animation.values.aroll.toFixed(1)} degrees</span>
                        <span>Tilt: ${geofs.animation.values.atilt.toFixed(1)} degrees</span>
                        <span id="bounces">Bounces: 0</span>
                    </div>
                `;
                    window.statsDiv.style.left = '0px';
                    if (geofs.nav.units.NAV1.inRange) {
                        window.statsDiv.innerHTML += `
                        <div style="margin-top: 10px; font-size: 14px;">
                            <span>Landed in TDZ? ${window.isInTDZ}</span>
                            <span>Deviation from center: ${geofs.nav.units.NAV1.courseDeviation.toFixed(1)}</span>
                        </div>`;
                    }
                    if (Number(window.vertSpeed) < 0) {
                        let qualityClass = '';
                        let qualityText = '';
                        if (Number(window.vertSpeed) >= -50) {
                            qualityClass = 'landing-quality';
                            qualityText = 'SUPER BUTTER!';
                            window.statsDiv.innerHTML += `
                                <div class="${qualityClass}" style="background-color: green; color: white;">
                                    ${qualityText}
                                </div>`;
                            window.softLanding.play();
                        } else if (Number(window.vertSpeed) >= -200) {
                            qualityClass = 'landing-quality';
                            qualityText = 'BUTTER';
                            window.statsDiv.innerHTML += `
                                <div class="${qualityClass}" style="background-color: green; color: white;">
                                    ${qualityText}
                                </div>`;
                            window.softLanding.play();
                        } else if (Number(window.vertSpeed) >= -500 && Number(window.vertSpeed) < -200) {
                            window.hardLanding.play();
                            window.statsDiv.innerHTML += `
                                <div class="${qualityClass}" style="background-color: yellow; color: black;">
                                    ACCEPTABLE
                                </div>`;
                        } else if (Number(window.vertSpeed) >= -1000 && Number(window.vertSpeed) < -500) {
                            window.hardLanding.play();
                            window.statsDiv.innerHTML += `
                                <div class="${qualityClass}" style="background-color: red; color: white;">
                                    HARD LANDING
                                </div>`;
                        }
                    }
                    if (Number(window.vertSpeed) <= -1000 || Number(window.vertSpeed > 200)) {
                        window.crashLanding.play();
                        window.statsDiv.innerHTML += `
                            <div class="landing-quality" style="background-color: crimson; color: white;">
                                u ded
                            </div>`;
                    }
                } else if (window.justLanded && window.statsOpen) {
                    window.bounces++;
                    var bounceP = document.getElementById("bounces");
                    bounceP.innerHTML = `Bounces: ${window.bounces}`;
                    window.softLanding.pause();
                }
                if (geofs.nav.units.NAV1.inRange) {
                    window.isInTDZ = ((geofs.nav.units.NAV1.distance * FEET_TO_METERS) > (0.052902913939976676 * geofs.runways.getNearestRunway([geofs.nav.units.NAV1.navaid.lat,geofs.nav.units.NAV1.navaid.lon,0]).lengthMeters)) && ((geofs.nav.units.NAV1.distance * FEET_TO_METERS) < (0.0613682505348497385 * geofs.runways.getNearestRunway([geofs.nav.units.NAV1.navaid.lat,geofs.nav.units.NAV1.navaid.lon,0]).lengthMeters)) ? "Yes" : "No";
                }
                window.groundSpeed = geofs.animation.values.groundSpeedKnt;
                window.ktias = geofs.animation.values.kias.toFixed(1);
                window.kTrue = geofs.aircraft.instance.trueAirSpeed.toFixed(1);
                window.vertSpeed = geofs.animation.values.verticalSpeed.toFixed(1);
                window.gForces = geofs.animation.values.accZ/9.80665;
                window.isGrounded = geofs.animation.values.groundContact;
                window.refreshRate = 12;
            } else {
                window.refreshRate = 60;
            }
        }
    }
    setInterval(updateLndgStats, window.refreshRate);

    function updateCalVertS() {
        if ((typeof geofs.animation.values != 'undefined' &&
             !geofs.isPaused()) &&
            ((geofs.animation.values.altitude !== undefined && geofs.animation.values.groundElevationFeet !== undefined) ? ((geofs.animation.values.altitude - geofs.animation.values.groundElevationFeet) + (geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2]*3.2808399)) : 'N/A') !== window.oldAGL) {
            window.newAGL = (geofs.animation.values.altitude !== undefined && geofs.animation.values.groundElevationFeet !== undefined) ? ((geofs.animation.values.altitude - geofs.animation.values.groundElevationFeet) + (geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2]*3.2808399)) : 'N/A';
            window.newTime = Date.now();
            window.calVertS = (window.newAGL - window.oldAGL) * (60000/(window.newTime - window.oldTime));
            window.oldAGL = (geofs.animation.values.altitude !== undefined && geofs.animation.values.groundElevationFeet !== undefined) ? ((geofs.animation.values.altitude - geofs.animation.values.groundElevationFeet) + (geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2]*3.2808399)) : 'N/A';
            window.oldTime = Date.now();
        }
    }
    setInterval(updateCalVertS, 25);

    window.closeLndgStats = function() {
        window.statsDiv.style.left = '-50%';
        setTimeout((function() {
            window.statsDiv.innerHTML = ``;
            window.statsOpen = false;
            window.bounces = 0;
        }), 400);
    }
}), 1000);
