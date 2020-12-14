/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import { Floats } from 'giu';
import { _Settings as Settings } from '../aeSettings';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');

describe('Settings', () => {
  it('01 normal', () => {
    const config = {
      langs: ['en', 'es'],
      srcPaths: ['src'],
      srcExtensions: ['.js', '.jsx'],
      msgFunctionNames: ['_t'],
      msgRegexps: [],
      fMinify: false,
    };
    const tree = renderer
      .create(
        <div>
          <Floats />
          <Settings
            lang="en"
            config={config}
            onChangeLang={() => {}}
            onClose={() => {}}
          />
        </div>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
