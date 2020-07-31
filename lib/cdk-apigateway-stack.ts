#! ./lib/cdk-apigateway-stack.ts
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sns from '@aws-cdk/aws-sns';
import * as ssm from '@aws-cdk/aws-ssm';
import * as subs from '@aws-cdk/aws-sns-subscriptions';

// extend StackProps so we can add the additional parameters needed
export interface ApiGatewayProps extends cdk.StackProps {
    stage: string,
    client: string,
    parameterPath: string
}

export class CdkApiGatewayStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: ApiGatewayProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        // defines the AWS Lambda handler

        // define the properties of the lambda function
        let lambdaProps: lambda.FunctionProps = {
            runtime: lambda.Runtime.NODEJS_12_X,            // execution environment
            code: lambda.Code.fromAsset('lambda/nodejs'),   // code loaded from "lambda" directory
            handler: 'contactForm.handler',                 // file is "contactForm", function is "handler"
            environment: {
                "client": props.client,
                "stage": props.stage,
                "parameterPath": props.parameterPath
            }
        };

        const contactFormHandler = new lambda.Function(this, 'contactForm', lambdaProps);

        // defines the Api Gateway
        const contactFormApi = new apigateway.LambdaRestApi(this, 'contactFormEndpoint', {
            handler: contactFormHandler,
            proxy: false
        });

        // api gateway contact-form resource options
        let cfPreflightOptions: apigateway.CorsOptions = {
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowCredentials: false,
            allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
            allowMethods: apigateway.Cors.ALL_METHODS
        }

        const form = contactFormApi.root.addResource('contact-form', {
            defaultCorsPreflightOptions: cfPreflightOptions
        });

        // const form = contactFormApi.root.addResource('contact-form');
        form.addMethod('POST');  // POST /items

        // the api-gateway url is
        const apiUrl = contactFormApi.url + form.path;

        // This apiUrl needs to be referenced by the static website. 
        // To pass the reference, let's add this value to the SSM parameter store.
        let apiUrlParameterName = props.parameterPath + '/contactFormApiUrl';

        const apiURLParameter = new ssm.StringParameter(this, 'apiUrlForContactForm', {
            allowedPattern: '.*',
            description: 'The contact-form url',
            parameterName: apiUrlParameterName,
            stringValue: apiUrl,
            tier: ssm.ParameterTier.STANDARD,
        });

        // define SNS for the contact form
        const topicName = "contactFormSNS" + "_" + props.stage;

        const snsTopicContactFormMessage = new sns.Topic(this, topicName, {
            displayName: 'Contact form topic',
        });

        // the SNS topic arn is consumed by the lambda code. For this solution, we 
        // are adding the arn of this topic to AWS Parameter Store so it can be retrieved by lambda at runtime.
        let ssmParameterName = props.parameterPath + '/contactFormSNSTopicArn';

        const snsTopicParameter = new ssm.StringParameter(this, 'contactFormSNSTopicArn', {
            allowedPattern: '.*',
            description: 'The SNS topic to which the contact form lambda hander should send the message to.',
            parameterName: ssmParameterName,
            stringValue: snsTopicContactFormMessage.topicArn,
            tier: ssm.ParameterTier.STANDARD,
        });

        // add subscription to your@email.address
        snsTopicContactFormMessage.addSubscription(new subs.EmailSubscription('your@email.address'));

        // grant read permissions to contactFormHandler
        snsTopicParameter.grantRead(contactFormHandler);  // permissions for the lambda handler to read the parameter
        snsTopicContactFormMessage.grantPublish(contactFormHandler);  // permissions for the lambda handler to publish to this sns topic.

    }
}