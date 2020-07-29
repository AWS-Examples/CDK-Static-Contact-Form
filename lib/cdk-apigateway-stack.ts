#! ./lib/cdk-apigateway-stack.ts
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class CdkApiGatewayStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


        // The code that defines your stack goes here
        // defines the AWS Lambda handler
        const contactFormHandler = new lambda.Function(this, 'contactForm', 
        {
            runtime: lambda.Runtime.NODEJS_12_X,    // execution environment
            code: lambda.Code.fromAsset('lambda/nodejs'),  // code loaded from "lambda/nodejs" directory
            handler: 'contactForm.handler',         // file is "contactForm", function is "handler"
        });

        // defines the Api Gateway
        const contactFormApi = new apigateway.LambdaRestApi(this, 'contactFormEndpoint', {
            handler: contactFormHandler,
            proxy: false
        });

        const form = contactFormApi.root.addResource('contact-form');
        form.addMethod('GET');  // GET /items
        form.addMethod('POST');  // POST /items

    }
}