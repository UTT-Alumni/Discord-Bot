import {
    Pole as Pole_t,
    Thematic as Thematic_t
} from '../prisma';

import * as db from './database';

import Thematic from './thematic';

class Pole {
    private id: string;

    constructor(id: string) {
        this.id = id;
    }

    public static addPole = async (
        name: Pole_t['name'],
        rolesChannelId: Pole_t['rolesChannelId']
    ) => {
        // TODO : check if the channel exists
        
        // Add to the database
        const pole = await db.createPole(name, rolesChannelId);

        return new Pole(pole.id);
    }

    public static getPole = async (name: Pole_t['name']) => {

        // Try to retrieve the corresponding pole in the database
        const pole = await db.getPole(name);

        // Return a Pole object if it exists
        return pole ? new Pole(pole.id) : null;
    }

    public addThematic = async (
        name: Thematic_t['name'],
        emoji: Thematic_t['emoji'],
        channelId: Thematic_t['channelId']
    ) => {
        // TODO: check if the channel exists

        // Add to the database
        const thematic = await db.createThematic(this.id, name, emoji, channelId);
        
        return new Thematic(thematic.id);
    }

    public getThematic = async (name: Thematic_t['name']) => {

        // Try to retrieve the corresponding thematic of the pole
        const thematic = await db.getPoleThematic(this.id, name);

        return thematic ? new Thematic(thematic.id) : null;
    }
}

export default Pole;