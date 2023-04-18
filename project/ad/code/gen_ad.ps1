param( 
    [Parameter(Mandatory=$true)] $JSONFile,
    [switch]$Undo
 )

function CreateADGroup(){
    param( [Parameter(Mandatory=$true)] $groupObject )

    $name = $groupObject.name

    Write-Good "Creating $groupObject.name Group"
    Try { New-ADGroup -name $name -GroupScope Global } Catch {}
}

function RemoveADGroup(){
    param( [Parameter(Mandatory=$true)] $groupObject )

    $name = $groupObject.name

    Write-Bad "Removing $groupObject.name Group"
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
    Write-Good "Creating $samAccountName User"
    Try { New-ADUser -Name "$name" -GivenName $firstname -Surname $lastname -SamAccountName $SamAccountName -UserPrincipalName $principalname@$Global:Domain -AccountPassword (ConvertTo-SecureString $password -AsPlainText -Force) -PassThru | Enable-ADAccount } Catch {}

    # Add the user to its appropriate group
    foreach($group_name in $userObject.groups) {

        try {
            # Get-ADGroup -Identity "$group_name"
            Write-Good "Adding $samAccountName to $group_name"
            Try { Add-ADGroupMember -Identity $group_name -Members $username } Catch {}
        }
        catch [Microsoft.ActiveDirectory.Management.ADIdentityNotFoundException]
        {
            Write-Info "User $name NOT added to group $group_name because it does not exist"
        }
    }
    
    # Add to local admin as needed
    # if ( $userObject.local_admin -eq $True){
    #     net localgroup administrators $Global:Domain\$username /add
    # }
    $add_command="net localgroup administrators $Global:Domain\$username /add"
    foreach ($hostname in $userObject.local_admin){
        echo "Invoke-Command -Computer $hostname -ScriptBlock { $add_command }" | Invoke-Expression | Out-Null
    }
}

function RemoveADUser(){
    param( [Parameter(Mandatory=$true)] $userObject )

    $name = $userObject.name
    $firstname, $lastname = $name.Split(" ")
    $username = ($firstname[0] + $lastname).ToLower()
    $samAccountName = $username

    Write-Bad "Removing $samAccountName User"
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
    Write-Good "Kerberoasting $svc $spn"
    Try { New-ADServiceAccount -Name $svc -ServicePrincipalNames "$svc/$spn.$Global:Domain" -AccountPassword (ConvertTo-SecureString $password -AsPlainText -Force) -RestrictToSingleComputer -PassThru | Out-Null } Catch {}
    
    foreach ($sv in $Global:ServicesAccountsAndSPNs) {
        if ($selected_service -ne $sv) {
            $svc = $sv.split(',')[0];
            $spn = $sv.split(',')[1];
            Write-Good "Creating $svc Services Account"
            $password = ([System.Web.Security.Membership]::GeneratePassword(12,2))
            Try { New-ADServiceAccount -Name $svc -ServicePrincipalNames "$svc/$spn.$Global:Domain" -AccountPassword (ConvertTo-SecureString $password -AsPlainText -Force) -RestrictToSingleComputer -PassThru | Out-Null } Catch {}
        }
    }
}

function VulnAD-RemoveServiceAccount(){
    param( [Parameter(Mandatory=$true)] $sv )
    if ($selected_service -ne $sv) {
        $svc = $sv.split(',')[0];
        $spn = $sv.split(',')[1];
        Write-Bad "Removing $svc Services Account"
        $password = ([System.Web.Security.Membership]::GeneratePassword(12,2))
        Try { Remove-ADServiceAccount -Identity $svc -Confirm:$False } Catch {}
    }
}

function VulnAD-ASREPRoasting {
    for ($i=1; $i -le (Get-Random -Maximum 4); $i=$i+1 ) {
        $userObject = (Get-Random -InputObject $Global:json.users)

        $name = $userObject.name
        $firstname, $lastname = $name.Split(" ")
        $username = ($firstname[0] + $lastname).ToLower()
        $samAccountName = $username
        #$password = (Get-Random -InputObject $Global:BadPasswords)
        #Set-AdAccountPassword -Identity $randomuser -Reset -NewPassword (ConvertTo-SecureString $password -AsPlainText -Force)
        Set-ADAccountControl -Identity $samAccountName -DoesNotRequirePreAuth 1
        Write-Good "AS-REPRoasting $samAccountName"
    }
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
    
    foreach ( $user in $Global:json.users ){
        CreateADUser $user
    }

    VulnAD-Kerberoasting
    VulnAD-ASREPRoasting
} else {
    StrengthenPasswordPolicy | Out-Null

    foreach ( $user in $Global:json.users ){
        RemoveADUser $user
    }
    foreach ( $group in $Global:json.groups ){
        RemoveADGroup $group
    }

    foreach ($sv in $Global:ServicesAccountsAndSPNs) {
        VulnAD-RemoveServiceAccount $sv
    }
}