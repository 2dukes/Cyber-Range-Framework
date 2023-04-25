param( 
    [Parameter(Mandatory=$true)] $JSONFile,
    [switch]$Undo
 )

function CreateADGroup(){
    param( [Parameter(Mandatory=$true)] $groupObject )

    $name = $groupObject.name

    Write-Info "Creating $groupObject.name Group"
    Try { New-ADGroup -name $name -GroupScope Global } Catch {}
}

function RemoveADGroup(){
    param( [Parameter(Mandatory=$true)] $groupObject )

    $name = $groupObject.name

    Write-Info "Removing $groupObject.name Group"
    Try { Remove-ADGroup -Identity $name -Confirm:$False } Catch {}
}

function CreateADUser(){
    param( [Parameter(Mandatory=$true)] $userObject )

    # Pull out the name from the JSON object
    $name = $userObject.name
    $password = $userObject.password

    # Generate a "first initial, last name" structure for username
    $firstname, $lastname = $name.Split(" ")
    $username = ($firstname[0] + $lastname).ToLower()
    $samAccountName = $username
    $principalname = $username

    # Actually create the AD user object
    Write-Info "Creating $samAccountName User"
    Try { New-ADUser -Name "$name" -GivenName $firstname -Surname $lastname -SamAccountName $SamAccountName -UserPrincipalName $principalname@$Global:Domain -AccountPassword (ConvertTo-SecureString $password -AsPlainText -Force) -PassThru | Enable-ADAccount } Catch {}

    # Add the user to its appropriate group
    foreach($group_name in $userObject.groups) {

        try {
            # Get-ADGroup -Identity "$group_name"
            Write-Info "Adding $samAccountName to $group_name"
            Try { Add-ADGroupMember -Identity $group_name -Members $username } Catch {}
        }
        catch [Microsoft.ActiveDirectory.Management.ADIdentityNotFoundException]
        {
            Write-Info "User $name NOT added to group $group_name because it does not exist"
        }
    }
    
    # Add to local admin as needed
    if ( $userObject.local_admin -eq $true){
        net localgroup administrators $Global:Domain\$username /add
        Write-Info "Adding $username to the Local Group Administrators"

        $sharePath = "C:\Users\Administrator"
        $acl = Get-Acl $sharePath
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("XYZ\$username", "ReadAndExecute", "Deny")
        $acl.AddAccessRule($rule)
        Set-Acl $sharePath $acl
    }
    # $add_command="net localgroup administrators $Global:Domain\$username /add"
    # foreach ($hostname in $userObject.local_admin){
    #     echo "Invoke-Command -Computer $hostname -ScriptBlock { $add_command }" | Invoke-Expression | Out-Null
    # }
}

function RemoveADUser(){
    param( [Parameter(Mandatory=$true)] $userObject )

    $name = $userObject.name
    $firstname, $lastname = $name.Split(" ")
    $username = ($firstname[0] + $lastname).ToLower()
    $samAccountName = $username

    Write-Info "Removing $samAccountName User"
    Try { Remove-ADUser -Identity $samAccountName -Confirm:$False } Catch {}
}

function WeakenPasswordPolicy(){
    secedit /export /cfg C:\Windows\Tasks\secpol.cfg
    (Get-Content C:\Windows\Tasks\secpol.cfg).replace("PasswordComplexity = 1", "PasswordComplexity = 0").replace("MinimumPasswordLength = 7", "MinimumPasswordLength = 1") | Out-File C:\Windows\Tasks\secpol.cfg
    secedit /configure /db c:\windows\security\local.sdb /cfg C:\Windows\Tasks\secpol.cfg /areas SECURITYPOLICY
    rm -force C:\Windows\Tasks\secpol.cfg -confirm:$false
}

function StrengthenPasswordPolicy(){
    secedit /export /cfg C:\Windows\Tasks\secpol.cfg
    (Get-Content C:\Windows\Tasks\secpol.cfg).replace("PasswordComplexity = 0", "PasswordComplexity = 1").replace("MinimumPasswordLength = 1", "MinimumPasswordLength = 7") | Out-File C:\Windows\Tasks\secpol.cfg
    secedit /configure /db c:\windows\security\local.sdb /cfg C:\Windows\Tasks\secpol.cfg /areas SECURITYPOLICY
    rm -force C:\Windows\Tasks\secpol.cfg -confirm:$false
}

function VulnAD-Kerberoasting {
    $selected_service = (Get-Random -InputObject $Global:ServicesAccountsAndSPNs)
    $svc = $selected_service.split(',')[0];
    $spn = $selected_service.split(',')[1];
    $password = (Get-Random -InputObject $Global:BadPasswords);
    Write-Info "Kerberoasting $svc $spn"
    Try { New-ADServiceAccount -KerberosEncryptionType "RC4" -Name $svc -ServicePrincipalNames "$svc/$spn.$Global:Domain" -AccountPassword (ConvertTo-SecureString $password -AsPlainText -Force) -RestrictToSingleComputer -PassThru | Out-Null } Catch {}
    Write-Good "Kerberoasting Done"

    foreach ($sv in $Global:ServicesAccountsAndSPNs) {
        if ($selected_service -ne $sv) {
            $svc = $sv.split(',')[0];
            $spn = $sv.split(',')[1];
            Write-Info "Creating $svc Services Account"
            $password = ([System.Web.Security.Membership]::GeneratePassword(12,2))
            Try { New-ADServiceAccount -SamAccountName $svc -Name $svc -ServicePrincipalNames "$svc/$spn.$Global:Domain" -AccountPassword (ConvertTo-SecureString $password -AsPlainText -Force) -RestrictToSingleComputer -PassThru | Out-Null } Catch {}
        }
    }
}

function VulnAD-RemoveServiceAccount(){
    param( [Parameter(Mandatory=$true)] $sv )
    if ($selected_service -ne $sv) {
        $svc = $sv.split(',')[0];
        $spn = $sv.split(',')[1];
        Write-Info "Removing $svc Services Account"
        $password = ([System.Web.Security.Membership]::GeneratePassword(12,2))
        Try { Remove-ADServiceAccount -Identity $svc -Confirm:$False } Catch {}
    }
}

function VulnAD-ASREPRoasting {
    for ($i=1; $i -le (Get-Random -Minimum 1 -Maximum 3); $i=$i+1 ) {
        $userObject = (Get-Random -InputObject $Global:json.users)
        
        $name = $userObject.name
        $firstname, $lastname = $name.Split(" ")
        $samAccountName = ($firstname[0] + $lastname).ToLower()
        #$password = (Get-Random -InputObject $Global:BadPasswords)
        #Set-AdAccountPassword -Identity $randomuser -Reset -NewPassword (ConvertTo-SecureString $password -AsPlainText -Force)
        Set-ADAccountControl -Identity $samAccountName -DoesNotRequirePreAuth 1
        Write-Info "AS-REPRoasting $samAccountName"
    }
}

function VulnAD-DnsAdmins {
    for ($i=1; $i -le (Get-Random -Minimum 1 -Maximum 3); $i=$i+1 ) {
        $userObject = (Get-Random -InputObject $Global:json.users)

        $name = $userObject.name
        $firstname, $lastname = $name.Split(" ")
        $samAccountName = ($firstname[0] + $lastname).ToLower()
        Add-ADGroupMember -Identity "DnsAdmins" -Members $samAccountName
        Write-Info "DnsAdmins : $samAccountName"
    }

    # $randomgroup = (GetRandom -InputObject $Global:groups)
    # Add-ADGroupMember -Identity "DnsAdmins" -Members $randomgroup
    # Write-Info "DnsAdmins Nested Group : $randomgroup"
}

function VulnAD-DCSync {
    for ($i=1; $i -le (Get-Random -Minimum 1 -Maximum 3); $i=$i+1 ) {
        $ADObject = [ADSI]("LDAP://" + (Get-ADDomain $Global:Domain).DistinguishedName)
        $userObject = (Get-Random -InputObject $Global:json.users)

        $name = $userObject.name
        $firstname, $lastname = $name.Split(" ")
        $samAccountName = ($firstname[0] + $lastname).ToLower()
        $sid = (Get-ADUser -Identity $samAccountName).sid
        
        # GUID Ref: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/1522b774-6464-41a3-87a5-1e5633c3fbbb
        # DCSync Ref: https://blog.netwrix.com/2021/11/30/what-is-dcsync-an-introduction/

        # Privilege: Replicating Directory Changes
        $objectGuidGetChanges = New-Object Guid 1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
        $ACEGetChanges = New-Object DirectoryServices.ActiveDirectoryAccessRule($sid,'ExtendedRight','Allow',$objectGuidGetChanges)
        $ADObject.psbase.Get_objectsecurity().AddAccessRule($ACEGetChanges)

        # Privilege: Replicating Directory Changes All
        $objectGuidGetChanges = New-Object Guid 1131f6ad-9c07-11d1-f79f-00c04fc2dcd2
        $ACEGetChanges = New-Object DirectoryServices.ActiveDirectoryAccessRule($sid,'ExtendedRight','Allow',$objectGuidGetChanges)
        $ADObject.psbase.Get_objectsecurity().AddAccessRule($ACEGetChanges)

        # Privilege: Replicating Directory Changes In Filtered Set
        $objectGuidGetChanges = New-Object Guid 89e95b76-444d-4c62-991a-0facbeda640c
        $ACEGetChanges = New-Object DirectoryServices.ActiveDirectoryAccessRule($sid,'ExtendedRight','Allow',$objectGuidGetChanges)
        $ADObject.psbase.Get_objectsecurity().AddAccessRule($ACEGetChanges)
        $ADObject.psbase.CommitChanges()

        Set-ADUser $samAccountName -Description "Replication Account"
        Write-Info "Giving DCSync to : $samAccountName"
    }
}

function VulnAD-DisableSMBSigning {
    Set-SmbClientConfiguration -RequireSecuritySignature 0 -EnableSecuritySignature 0 -Confirm -Force
}

$Global:Spacing = "`t"
$Global:PlusLine = "`t[+]"
$Global:ErrorLine = "`t[-]"
$Global:InfoLine = "`t[*]"

function Write-Good { param( $String ) Write-Host $Global:PlusLine  $String -ForegroundColor 'Green'}
function Write-Bad  { param( $String ) Write-Host $Global:ErrorLine $String -ForegroundColor 'red'  }
function Write-Info { param( $String ) Write-Host $Global:InfoLine $String -ForegroundColor 'gray' }

$Global:json = ( Get-Content $JSONFile | ConvertFrom-JSON)
$Global:Domain = $Global:json.domain

$Global:ServicesAccountsAndSPNs = @('mssql_svc,mssqlserver','http_svc,httpserver','exchange_svc,exserver');
$Global:BadPasswords = [System.Collections.ArrayList](Get-Content "data/passwords.txt")

if ( -not $Undo) {
    WeakenPasswordPolicy | Out-Null

    foreach ( $group in $Global:json.groups ){
        CreateADGroup $group
    }
    Write-Good "Created AD Groups"

    foreach ( $user in $Global:json.users ){
        CreateADUser $user
    }
    Write-Good "Created AD User Accounts"

    VulnAD-Kerberoasting
    Write-Good "Created AD Service Accounts"

    VulnAD-ASREPRoasting
    Write-Good "AS-REPRoasting Done"

    VulnAD-DnsAdmins
    Write-Good "DNS Admins Done"

    VulnAD-DCSync
    Write-Good "DCSync Done"

    VulnAD-DisableSMBSigning
    Write-Good "SMB Signing Disabled"
} else {
    StrengthenPasswordPolicy | Out-Null

    foreach ( $user in $Global:json.users ){
        RemoveADUser $user
    }
    Write-Bad "Removed AD User Accounts"

    foreach ( $group in $Global:json.groups ){
        RemoveADGroup $group
    }
    Write-Bad "Removed AD Groups"

    foreach ($sv in $Global:ServicesAccountsAndSPNs) {
        VulnAD-RemoveServiceAccount $sv
    }
    Write-Bad "Removed Service Accounts"
}
