#! ./lib/cdk-static-website-stack.ts
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import { BucketProps, BucketEncryption } from '@aws-cdk/aws-s3';
import * as ssm from '@aws-cdk/aws-ssm';
import * as fs from 'fs';

// extend StackProps so we can add the additional parameters needed
export interface StaticWebsiteProps extends cdk.StackProps {
    stage: string,
    client: string,
    parameterPath: string
  };

export class CdkStaticWebsiteStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: StaticWebsiteProps) {
        super(scope, id, props);

        // get api url path from SSM Parameter Store
        const apiUrlParameterPath = props.parameterPath + '/contactFormApiUrl'
        const apiTargetPath = ssm.StringParameter.valueFromLookup(this, apiUrlParameterPath) || '#'; // the default value is '#' 

        // Create file with url path
        // The file will be created if it doesn't exist
        // If the file exists, then its content will be replaced.
        const apiTargetFunction: string = "function getContactUrl () {return \"" + apiTargetPath + "\" }"
        fs.writeFileSync('./website/contact-form-api-target.js', apiTargetFunction);

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


