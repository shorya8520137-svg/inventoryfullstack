@echo off
echo Testing SSH connection to correct IP...
echo Using: ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo 'SSH connection successful!' && hostname && whoami"

pause