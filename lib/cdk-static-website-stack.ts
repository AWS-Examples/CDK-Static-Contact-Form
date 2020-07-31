#! ./lib/cdk-static-website-stack.ts
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import { BucketProps, BucketEncryption } from '@aws-cdk/aws-s3';
import { StackProps } from '@aws-cdk/core';

export class CdkStaticWebsiteStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        let newProps: BucketProps = {
            publicReadAccess: true,
            websiteIndexDocument: "index.html",
            encryption: BucketEncryption.S3_MANAGED,
            versioned: true
        };

        const bucket = new s3.Bucket(this, 'staticWebsite', newProps);

        new s3Deployment.BucketDeployment(this, 'Deployment', {
            sources: [s3Deployment.Source.asset('./website')], // path to the static website resources
            destinationBucket: bucket
        })

        new cdk.CfnOutput(this, 'bucketRegionalDomainName', {
            value: 'https://' + bucket.bucketRegionalDomainName + '/index.html'
        })
    }
}


