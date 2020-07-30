#! ./test/cdk-contact-form.test.ts
import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as CdkApiGateway from '../lib/cdk-apigateway-stack';

// populate ApiGatewayProps (which )
const apiGatewayProps: CdkApiGateway.ApiGatewayProps = {
    tags: {
        "client": 'clientVal',
        "stage": 'stageVal'
    },
    stage: 'stageVal',
    client: 'clientVal',
    parameterPath: '/parameterPath'
};

test('Not-an-empty-stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CdkApiGateway.CdkApiGatewayStack(app, 'MyTestStack', apiGatewayProps);
    // THEN
    expectCDK(stack).notTo(matchTemplate({
        "Resources": {}
    }, MatchStyle.EXACT))
});