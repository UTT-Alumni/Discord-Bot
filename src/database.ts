import {
    PrismaClient,
    Pole,
    Project,
    Thematic
} from '../prisma';

const prisma = new PrismaClient();

const createPole = async (name: Pole['name'], rolesChannelId: Pole['rolesChannelId']) => {
    const pole = await prisma.pole.create({
        data: {
            name,
            rolesChannelId
        }
    });

    return pole;
}

const getPole = async (name: Pole['name']) => {
    const pole = await prisma.pole.findUnique({
        where: {
            name
        }
    });

    return pole;
};


const createThematic = async (
    poleId: Thematic['poleId'],
    name: Thematic['name'],
    emoji: Thematic['emoji'],
    channelId: Thematic['channelId']
) => {
    const thematic = await prisma.thematic.create({
        data: {
            poleId,
            name,
            emoji,
            channelId
        }
    });

    return thematic;
}

const getPoleThematic = async (poleId: Pole['id'], name: Thematic['name']) => {
    const thematic = await prisma.thematic.findUnique({
        where: {
            poleId,
            name
        }
    });

    return thematic;
};

const createProject = async (
    thematicId: Project['thematicId'],
    name: Project['name'],
    channelId: Project['channelId'],
) => {
    const project = await prisma.project.create({
        data: {
            thematicId,
            name,
            channelId
        }
    });

    return project;
}

export {
    createPole, getPole,
    createThematic, getPoleThematic,
    createProject,
};