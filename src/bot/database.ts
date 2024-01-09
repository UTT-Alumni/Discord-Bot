import { Pole as Pole_t, PrismaClient, Project as Project_t, Thematic as Thematic_t } from "../../prisma";

const prisma = new PrismaClient();

const createPole = async (name: Pole_t['name'], emoji: Pole_t['emoji'], rolesChannelId: Pole_t['rolesChannelId']) => {
  return prisma.pole.create({
    data: {
      name,
      emoji,
      rolesChannelId,
    },
  });
};

const getPole = async (id: Pole_t['id']) => {
  return prisma.pole.findUnique({
    where: {
      id,
    },
  });
};

const getPoleByName = async (name: Pole_t['name']) => {
  return prisma.pole.findUnique({
    where: {
      name,
    },
  });
};

const getPoles = async () => prisma.pole.findMany();

const deletePole = async (name: Pole_t['name']) => {
  // Get pole
  const pole = await prisma.pole.findUnique({
    where: {
      name,
    },
  });

  if (!pole) return 'Unable to find the pole.';

  // Get thematics
  const thematics = await prisma.thematic.findMany({
    where: {
      poleId: pole.id,
    },
  });

  // Delete projects
  for (const thematic of thematics) {
    await prisma.project.deleteMany({
      where: {
        thematicId: thematic.id,
      },
    });
  }

  // Delete thematics
  await prisma.thematic.deleteMany({
    where: {
      poleId: pole.id,
    },
  });

  // Delete pole
  await prisma.pole.delete({
    where: {
      name,
    },
  });

  return null;
};

const createThematic = async (
  poleId: Thematic_t['poleId'],
  name: Thematic_t['name'],
  emoji: Thematic_t['emoji'],
  roleId: Thematic_t['roleId'],
  channelId: Thematic_t['channelId'],
) => {
  return prisma.thematic.create({
    data: {
      poleId,
      name,
      emoji,
      roleId,
      channelId,
    },
  });
};

const getThematicById = async (id: Thematic_t['id']) => {
  return prisma.thematic.findUnique({
    where: {
      id,
    },
  });
};

const getThematicByName = async (poleId: Pole_t['id'], name: Thematic_t['name']) => {
  return prisma.thematic.findFirst({
    where: {
      poleId,
      name,
    },
  });
};

const getThematicByEmoji = async (poleId: Thematic_t['poleId'], emoji: Thematic_t['emoji']) => {
  return prisma.thematic.findFirst({
    where: {
      poleId,
      emoji,
    },
  });
};

const getThematics = async (poleId: Pole_t['id']) => {
  return prisma.thematic.findMany({
    where: {
      poleId,
    },
  });
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

const deleteThematic = async (poleName: Pole_t['name'], thematicName: Thematic_t['name']) => {
  // Get pole
  const pole = await prisma.pole.findUnique({
    where: {
      name: poleName,
    },
  });

  if (!pole) return 'Unable to find the pole.';

  // Get thematic
  const thematics = await prisma.thematic.findMany({
    where: {
      poleId: pole.id,
      name: thematicName,
    },
  });

  if (thematics.length !== 1) return 'Unable to find the thematic.';

  // Delete projects
  await prisma.project.deleteMany({
    where: {
      thematicId: thematics[0].id,
    },
  });

  // Delete thematic
  await prisma.thematic.deleteMany({
    where: {
      poleId: pole.id,
      name: thematicName,
    },
  });

  return null;
};

const createProject = async (
  thematicId: Project_t['thematicId'],
  name: Project_t['name'],
  channelId: Project_t['channelId'],
) => {
  return prisma.project.create({
    data: {
      thematicId,
      name,
      channelId,
    },
  });
};

const getProjects = async (thematicId: Thematic_t['id']) => {
  return prisma.project.findMany({
    where: {
      thematicId,
    },
  });
};

const deleteProject = async (
  poleName: Pole_t['name'],
  thematicName: Thematic_t['name'],
  projectName: Project_t['name'],
) => {
  // Get pole
  const pole = await prisma.pole.findUnique({
    where: {
      name: poleName,
    },
  });

  if (!pole) return 'Unable to find the pole.';

  // Get thematic
  const thematics = await prisma.thematic.findMany({
    where: {
      poleId: pole.id,
      name: thematicName,
    },
  });

  if (thematics.length !== 1) return 'Unable to find the thematic.';

  const projects = await prisma.project.findMany({
    where: {
      thematicId: thematics[0].id,
      name: projectName,
    },
  });

  if (projects.length !== 1) return 'Unable to find the project.';

  // Delete project
  await prisma.project.deleteMany({
    where: {
      thematicId: thematics[0].id,
      name: projectName,
    },
  });

  return null;
};

export {
  createPole, getPole, getPoleByName, getPoles, deletePole,
  createThematic, getThematicById, getThematicByName,
  getThematicByEmoji, getThematics, getThematicRoleId, deleteThematic,
  createProject, getProjects, deleteProject,
};
