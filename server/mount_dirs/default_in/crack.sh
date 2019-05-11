#!/bin/bash
mkdir ~/.john
cp /etc/john/john.conf ~/.john/
john --format=sha512crypt --wordlist=/in/password.lst /in/psw > /home/john/out_console.txt
