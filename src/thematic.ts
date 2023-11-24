import { Project as Project_t } from '../prisma';

import * as db from './database';

class Thematic {
    private id: string;

    constructor(id: string) {
        this.id = id;
    }

    public addProject = async (
        name: Project_t['name'],
        channelId: Project_t['channelId']
    ) => {
        // TODO: check if the channel exists

        // Add to the database
        await db.createProject(this.id, name, channelId);
    }
}

export default Thematic;