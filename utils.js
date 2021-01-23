import * as THREE from "three";

export const CUBE_STATES = {ACTIVE: 'active', STOPPED: 'stopped', MISSED: 'missed'};
export const MOVE_AMOUNT = 12;
export const GAME_STATES = {
    'LOADING': 'loading',
    'PLAYING': 'playing',
    'READY': 'ready',
    'ENDED': 'ended',
    'RESETTING': 'resetting',
    'PAUSED': 'paused'
}

export const removeLights = (group) => {
    group.children = group.children.filter(child => 
        (child instanceof THREE.Light) === false
    );
    group.children.forEach(child => {
        if (child.children.length > 0) {
            removeLights(child);
        }
    })
};

export const setUpShadows = (group) => {
    group.traverse((node) => {
        if (node.isMesh) { 
            node.castShadow = true;
            node.recievesShadow = true;
        }
    });
}