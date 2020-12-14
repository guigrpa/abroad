// @flow

/* eslint-disable no-param-reassign */

import socketio from 'socket.io';
import { mainStory, chalk } from 'storyboard';
import { subscribe as gqlSubscribe, parse as gqlParse } from 'graphql';

// ==============================================
// Types
// ==============================================
type WsMessage = WsMessageSubscribe | WsMessageNotif;
type WsMessageSubscribe = {
  type: 'SUBSCRIBE',
  subscriptionId: string,
  query: string,
  variables?: Object,
};
type WsMessageNotif = {
  type: 'NOTIF',
  subscriptionId: string,
  payload: Object,
};
type WsContext = {
  socket: Object,
  gqlSchema: Object,
  subscriptions: { [subscriptionId: string]: Object },
};

// ==============================================
// Main
// ==============================================
const init = ({
  httpServer,
  socketServer,
  gqlSchema,
}: {|
  httpServer: Object,
  socketServer?: Object,
  gqlSchema: Object,
|}) => {
  const socketioServer =
    socketServer != null ? socketServer : socketio(httpServer);
  const namespaceServer = socketioServer.of('/mady');
  namespaceServer.on('connect', onConnect(gqlSchema));
  return socketioServer;
};

const onConnect = gqlSchema => socket => {
  mainStory.debug('socket', 'Socket connected');
  const context = { socket, gqlSchema, subscriptions: {} };
  const closeHandler = onCloseOrError(context);
  socket.on('error', closeHandler);
  socket.on('disconnect', closeHandler);
  socket.on('MESSAGE', rx(context));
};

const onCloseOrError = context => (/* error */) => {
  const { subscriptions } = context;
  Object.keys(subscriptions).forEach(subscriptionId => {
    doUnsubscribe(context, subscriptionId);
  });
};

// ==============================================
// Message processing
// ==============================================
const rx = (context: WsContext) => (msg: WsMessage) => {
  mainStory.debug(
    'socket',
    `RX ${chalk.magenta(msg.type)} ${
      msg.type === 'SUBSCRIBE' ? chalk.yellow(msg.subscriptionId) : ''
    }`,
    { attach: msg, attachLevel: 'trace' }
  );
  if (msg.type === 'SUBSCRIBE') rxSubscribe(context, msg);
};

const rxSubscribe = async (context, msg: WsMessageSubscribe) => {
  const { socket } = context;
  const { subscriptionId, query, variables } = msg;
  let ast;
  try {
    if (!query) throw new Error('MISSING_QUERY');
    ast = gqlParse(query);
  } catch (err) {
    mainStory.error('socket', 'GraphQL parse error', { attach: err });
    return;
  }
  let subscription;
  try {
    subscription = gqlSubscribe(context.gqlSchema, ast, null, null, variables);
    context.subscriptions[subscriptionId] = subscription;
  } catch (err) {
    mainStory.error('socket', 'GraphQL subscribe error', { attach: err });
    return;
  }
  /* eslint-disable no-await-in-loop, no-constant-condition */
  while (true) {
    const { done, value: payload } = await subscription.next();
    if (done) break;
    // mainStory.debug('socket', 'Retransmitting payload...', { attach: payload });
    socket.emit('MESSAGE', { type: 'NOTIF', subscriptionId, payload });
  }
  /* eslint-enable no-await-in-loop, no-constant-condition */
};

// ==============================================
// Subscribe/unsubscribe
// ==============================================
const doUnsubscribe = (context, subscriptionId) => {
  const { subscriptions } = context;
  const subscription = subscriptions[subscriptionId];
  if (!subscription) return;

  // Stop the async iterator (GraphQL-provided response stream)
  // from the outside
  subscription.return();

  // This removes the stored reference to the async iterator;
  // the other reference we have is the closure that waits infinitely
  // for the iterator's products, which will also disappear when the
  // iterator returns
  delete subscriptions[subscriptionId];
};

// ==============================================
// Public
// ==============================================
export { init };
