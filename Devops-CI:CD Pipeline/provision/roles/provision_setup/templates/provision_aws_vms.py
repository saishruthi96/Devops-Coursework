import boto3
import sys
import logging
import os
import json


session =boto3.session.Session(region_name=os.getenv('AWS_REGION'), aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'), aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'))

ec2 = session.resource('ec2')

ec2_client = session.client('ec2')

def create_instance(inst):
    # //provisioning ubuntu 20.04 LTS
    create_response = ec2.create_instances(ImageId='ami-08962a4068733a2b6', MinCount=1, MaxCount=1, InstanceType='t2.micro', KeyName='ec2-keypair')
    create_response = create_response[0]
    # wait for instance to move to running state
    create_response.wait_until_running()
    create_response.load()
    resource_id = str(create_response.instance_id)
    ec2.create_tags(Resources=[resource_id], Tags=[{'Key': 'Name', 'Value': inst}])
    ans = ec2_client.describe_instances(InstanceIds=[resource_id])  
    return ans['Reservations'][0]['Instances'][0]['PublicIpAddress']

if __name__ == "__main__":
    instances = {}
    names = ['checkbox', 'itrust', 'monitor']    
    instances = {"checkbox":"","itrust":"","monitor":""}
   
    for i in names:
        instances[i] = create_instance(i)

    # saving the server info to json for monitoring purpose
    servers ={}
    servers['monitor']=instances['monitor']
    servers['checkbox']=instances['checkbox']
    servers['itrust']=instances['itrust']
    with open('/home/vagrant/servers.json', 'w') as outfile:
        json.dump(servers, outfile)
     
    # allowing inbound traffic
    try:
        ec2_client.authorize_security_group_ingress(
            GroupId='sg-707cf603',
            IpPermissions=[
                {
                    'IpProtocol': 'tcp',
                    'FromPort': 0,
                    'ToPort': 65535,
                    'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
                }
            ]
        )
    except:
        logging.info("Security group configuration already exists!!!")            

    # write instances IP in the .ini file
    keypair_file = "/home/vagrant/.ssh/ec2-keypair"
    # creating inventory.ini file
    with open('/home/vagrant/inventory.ini', 'w+') as outfile:
        for iname, ip in instances.items():
            outfile.write("[{}]\n".format(iname))
            outfile.write("{} ansible_ssh_private_key_file={} ansible_user={}\n".format(ip, keypair_file, "ubuntu"))

