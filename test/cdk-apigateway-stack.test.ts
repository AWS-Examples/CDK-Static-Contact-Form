#! ./test/cdk-apigateway.test.ts
import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as CdkApiGateway from '../lib/cdk-apigateway-stack';

test('Not-an-empty-stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CdkApiGateway.CdkApiGatewayStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).notTo(matchTemplate({
        "Resources": {}
    }, MatchStyle.EXACT))
});