#! ./lib/cdk-sns-subscription-email-stack.ts (G38)
import * as cdk from '@aws-cdk/core';
import * as ssm from '@aws-cdk/aws-ssm'
import * as sns from '@aws-cdk/aws-sns';
import * as subs from '@aws-cdk/aws-sns-subscriptions';

// extend StackProps so we can add the additional parameters needed
export interface SnsSubscriptionEmailProps extends cdk.StackProps {
    stage: string,
    client: string,
    parameterPath: string
};

export class CdkSnsSubscriptionEmailStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: SnsSubscriptionEmailProps) {
        super(scope, id, props);

        // Retrieve the topic ARN from the SSM Parameter Store
        const snsArnParameterName = props.parameterPath + '/contactFormSNSTopicArn';
        const topicArn = ssm.StringParameter.valueForStringParameter(this, snsArnParameterName);

        // Create the topic name 
        const topicName = "contactFormSNS" + "_" + props.stage;

        // Create a reference to the topic
        const snsTopicContactFormMessage = sns.Topic.fromTopicArn(this, topicName, topicArn);

        // Add subscription to your@email.address
        snsTopicContactFormMessage.addSubscription(new subs.EmailSubscription('your@email.address'));
    }
}