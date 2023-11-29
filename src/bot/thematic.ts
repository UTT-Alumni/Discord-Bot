import { Project as Project_t } from '../../prisma';

import * as db from './database';

class Thematic {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  public addProject = async (
    channelId: Project_t['channelId'],
  ) => {
    // TODO: check if the channel exists

    // TODO: change permissions for the channel to be visible from users with associated role only

    // Add to the database
    await db.createProject(this.id, channelId);
  };
}

export default Thematic;
