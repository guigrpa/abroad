// @flow

import { setIn } from 'timm';
import { commitMutation, requestSubscription } from 'react-relay';
import { mainStory } from 'storyboard';
import { notify, simplifyString } from 'giu';
import _t from '../../translate';

// Runs a Relay mutation inside a Storyboard story
const mutate = ({
  description,
  environment,
  mutationOptions: mutationOptions0,
  onFailure,
  onSuccess,
  onFinish,
}: {|
  description: string,
  environment: Object,
  mutationOptions: Object,
  input?: Object,
  onFailure?: (failure: Object) => void,
  onSuccess?: (response: Object) => void,
  onFinish?: () => void,
|}) => {
  const story = mainStory.child({
    src: 'views',
    title: description,
  });
  let mutationOptions = mutationOptions0;
  mutationOptions = setIn(
    mutationOptions,
    ['variables', 'input', 'storyId'],
    story.storyId
  );
  commitMutation(environment, {
    ...mutationOptions,
    onCompleted: response => {
      story.debug('views', 'Transaction result:', {
        attach: response,
        attachLevel: 'trace',
      });
      tearDown(story);
      if (onSuccess) onSuccess(response);
      if (onFinish) onFinish();
    },
    onError: err => {
      const error = err.message || new Error('Mutation failed');
      story.error('views', 'Transaction error:', { attach: error });
      tearDown(story);
      if (onFailure) {
        onFailure(err);
      } else {
        notify({
          title: _t('error_Changes could not be saved'),
          msg: _t('error_Is the server running?'),
          type: 'error',
          icon: 'save',
        });
      }
      if (onFinish) onFinish();
    },
  });
};

const subscribe = ({
  environment,
  subscriptionOptions,
}: {|
  environment: Object,
  subscriptionOptions: Object,
|}) => {
  requestSubscription(environment, {
    ...subscriptionOptions,
    // onNext: data => {
    //   console.log('RX at END-USER-LEVEL:', data);
    // },
  });
};

const tearDown = story => {
  story.close();
};

const cachedSimplifiedStrings = {};
const simplifyStringWithCache = (str: string) => {
  let out = cachedSimplifiedStrings[str];
  if (out == null) {
    out = simplifyString(str);
    cachedSimplifiedStrings[str] = out;
  }
  return out;
};

// ===================================================
// Public
// ===================================================
export { mutate, subscribe, simplifyStringWithCache };
