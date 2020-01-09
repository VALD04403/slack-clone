const dataAccess = require('./data-access');
const services = require('./services');

const getChannels = async (req, res) => {
  const channels = await dataAccess.getChannels();
  return res.status(200).json({ channels });
};

const createChannel = async (req, res) => {
  const { name } = req.body;

  const channelId = await services.createChannelAndGetId(name);

  return res.status(201).send(`Channel added with ID: ${channelId}`);
};

const getMessagesByChannelId = async (req, res) => {
  const { channelId } = req.params;

  const messages = await dataAccess.getMessagesByChannel(channelId);

  return res.status(200).json({ messages });
};

const createMessage = async (req, res) => {
  const { text, channelId } = req.body;
  const { user } = req;
  await dataAccess.createMessage(text, channelId, user.id);

  return res.status(201).send('Message added');
};

const getCleanPassword = password => {
  if (password.length >= 8) {
    return password;
  }
  throw new Error('Password must contain at least 8 characters.');
};

const createUser = async (req, res) => {
  try {
    const { username } = req.body;
    const password = getCleanPassword(req.body.password);
    await dataAccess.createUser(username, password);
  } catch (error) {
    if (error.isUnknown) {
      return res.sendStatus(500);
    }
    return res.status(400).send({ errorMessage: error.message });
  }
  return res.sendStatus(201);
};

const createSession = async (req, res) => {
  const { username, password } = req.body;
  const userId = await dataAccess.getVerifiedUserId(username, password);
  const sessionId = await dataAccess.createSession(userId);
  res.cookie('sessionId', sessionId, { maxAge: 999900000, httpOnly: true });
  return res.sendStatus(201);
};

const deleteSession = async (req, res) => {
  const { sessionId } = req.cookies;
  await dataAccess.deleteSession(sessionId);
  return res.sendStatus(200);
};

const getCurrentUser = async (req, res) => {
  const { user } = req;
  if (user) {
    return res.status(200).send(user);
  }
  return res.sendStatus(401);
};

module.exports = {
  getChannels,
  createChannel,
  getMessagesByChannelId,
  createMessage,
  createUser,
  createSession,
  deleteSession,
  getCurrentUser,
};
