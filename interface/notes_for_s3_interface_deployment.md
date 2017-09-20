# Notes for deploying interface single page app to AWS S3 bucket

Download and configure aws command line interface 
(http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html)

Set up users, passwords and permissions with AWS IAM
(http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html)

Initialize S3 bucket using AWS console or something like terraform
(https://www.terraform.io/)

Upload bin folder to S3 bucket using aws-cli 'sync' command

```shell
# Inside the current folder (adage-server/interface), run
aws s3 sync ./bin s3://<your s3 bucket name>

```
