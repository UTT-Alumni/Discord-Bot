import {
  PrismaClient,
  Pole as Pole_t,
  Thematic as Thematic_t,
  Project as Project_t,
} from '../prisma';

const prisma = new PrismaClient();

const createPole = async (name: Pole_t['name'], rolesChannelId: Pole_t['rolesChannelId']) => {
  const pole = await prisma.pole.create({
    data: {
      name,
      rolesChannelId,
    },
  });

  return pole;
};

const getPole = async (name: Pole_t['name']) => {
  const pole = await prisma.pole.findUnique({
    where: {
      name,
    },
  });

  return pole;
};

const getPoles = async () => prisma.pole.findMany();

const createThematic = async (
  poleId: Thematic_t['poleId'],
  name: Thematic_t['name'],
  emoji: Thematic_t['emoji'],
  roleId: Thematic_t['roleId'],
  channelId: Thematic_t['channelId'],
) => {
  const thematic = await prisma.thematic.create({
    data: {
      poleId,
      name,
      emoji,
      roleId,
      channelId,
    },
  });

  return thematic;
};

const getPoleThematic = async (poleId: Pole_t['id'], name: Thematic_t['name']) => {
  const thematic = await prisma.thematic.findUnique({
    where: {
      poleId,
      name,
    },
  });

  return thematic;
};

const getPoleThematics = async (poleId: Pole_t['id']) => {
  const thematics = await prisma.thematic.findMany({
    where: {
      poleId,
    },
  });

  return thematics;
};

const createProject = async (
  thematicId: Project_t['thematicId'],
  channelId: Project_t['channelId'],
) => {
  const project = await prisma.project.create({
    data: {
      thematicId,
      channelId,
    },
  });

  return project;
};

const getThematicProjects = async (thematicId: Thematic_t['id']) => {
  const projects = await prisma.project.findMany({
    where: {
      thematicId,
    },
  });

  return projects;
};

export {
  createPole, getPole, getPoles,
  createThematic, getPoleThematic, getPoleThematics,
  createProject, getThematicProjects,
};
