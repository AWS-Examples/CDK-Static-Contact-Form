#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkApiGatewayStack } from '../lib/cdk-apigateway-stack';

const app = new cdk.App();
new CdkApiGatewayStack(app, 'CdkApiGatewayStack');
