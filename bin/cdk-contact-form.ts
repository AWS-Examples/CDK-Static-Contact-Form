#! /bin/cdk-contact-form.ts
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkApiGatewayStack, ApiGatewayProps } from '../lib/cdk-apigateway-stack';
import { CdkStaticWebsiteStack, StaticWebsiteProps } from '../lib/cdk-static-website-stack';

const app = new cdk.App();

const defaultEnvironment = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
    }

const clientVal = app.node.tryGetContext('client') || 'internal'; //the default value is 'internal'
const stageVal = app.node.tryGetContext('stage') || 'developoer'; // the defualt value is developer
const developerName = app.node.tryGetContext('developername') || process.env.USER || '';  // leave blank if hte username cannot be derived

// derive the parameter path to retrieve parameters from the SSM Parameter Store
var parameterPath: string = '';
if (stageVal.toLowerCase() == 'developer') {
    parameterPath = '/' + clientVal + '/dev/' + developerName;
} else {
    parameterPath = '/' + clientVal + '/' + stageVal;
};

// populate ApiGatewayProps
const apiGatewayProp: ApiGatewayProps = {
    tags: {
        "client": clientVal,
        "stage": stageVal
    },
    env: defaultEnvironment,
    stage: stageVal,
    client: clientVal,
    parameterPath: parameterPath.toLowerCase()
};

new CdkApiGatewayStack(app, 'CdkApiGatewayStack', apiGatewayProp);

// Poplulate StaticWebsiteProps
const staticWebsiteProps: StaticWebsiteProps = {
    tags: {
      "client": clientVal,
      "stage": stageVal
    },
    env: defaultEnvironment,
    stage: stageVal,
    client: clientVal,
    parameterPath: parameterPath.toLowerCase()
  };
  
  new CdkStaticWebsiteStack(app, 'CdkStaticWebsiteStack', staticWebsiteProps);