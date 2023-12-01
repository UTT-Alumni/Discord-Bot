import {
  PrismaClient,
  Pole as Pole_t,
  Thematic as Thematic_t,
  Project as Project_t,
} from '../../prisma';

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

const getPole = async (id: Pole_t['id']) => {
  const pole = await prisma.pole.findUnique({
    where: {
      id,
    },
  });

  return pole;
};

const getPoleByName = async (name: Pole_t['name']) => {
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

const getThematicByName = async (poleId: Pole_t['id'], name: Thematic_t['name']) => {
  const thematic = await prisma.thematic.findUnique({
    where: {
      poleId,
      name,
    },
  });

  return thematic;
};

const getThematicByEmoji = async (emoji: Thematic_t['emoji']) => {
  const thematic = await prisma.thematic.findUnique({
    where: {
      emoji,
    },
  });

  return thematic;
};

const getThematics = async (poleId: Pole_t['id']) => {
  const thematics = await prisma.thematic.findMany({
    where: {
      poleId,
    },
  });

  return thematics;
};

const getThematicRoleId = async (thematicId: Thematic_t['id']) => {
  const thematic = await prisma.thematic.findUnique({
    select: {
      roleId: true,
    },
    where: {
      id: thematicId,
    },
  });

  return thematic?.roleId;
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

const getProjects = async (thematicId: Thematic_t['id']) => {
  const projects = await prisma.project.findMany({
    where: {
      thematicId,
    },
  });

  return projects;
};

export {
  createPole, getPole, getPoleByName, getPoles,
  createThematic, getThematicByName, getThematicByEmoji, getThematics, getThematicRoleId,
  createProject, getProjects,
};
