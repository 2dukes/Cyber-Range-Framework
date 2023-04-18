# Refs: 
# https://social.technet.microsoft.com/Forums/en-US/b67a99cd-2b08-4f73-aa04-f2314913059e/listing-groups-from-rsopuserprivilegeright-with-powershell?forum=ITCG
# https://serverfault.com/questions/1095018/programmatically-grant-a-user-the-ability-to-log-on-using-remote-desktop
# https://theitbros.com/to-sign-in-remotely-you-need-the-right-to-sign-in-through-remote-desktop-service/

net localgroup "Remote Desktop Users" /add "xyz\Domain Users"

# Local Group Policy Editor > Computer Configuration > Windows Settings > Security Settings > Local Policies > User Rights Assignment

$user = "xyz\Domain Users"
$privilege = "SeRemoteInteractiveLogonRight"
write-host "Adding Power Users group to Allow log on through Remote Desktop Services..."
secedit /export /areas USER_RIGHTS /cfg $env:USERPROFILE\UserRights.inf
"[Unicode]`r`nUnicode=yes`r`n`r`n[Version]`r`nsignature=`"`$CHICAGO`$`"`r`nrevision=1`r`n`r`n[Privilege Rights]" `
    | Out-File $env:USERPROFILE\new.inf -Force -WhatIf:$false 
$UserRights = Get-Content $env:USERPROFILE\UserRights.inf
foreach($line in $UserRights){ 
    if($line -like "$privilege`*"){ 
        $line = $line + ",$user"
        $line | Out-File $env:USERPROFILE\new.inf -Append -WhatIf:$false
        SECEDIT /configure /db secedit.sdb /cfg $env:USERPROFILE\new.inf
        Remove-Item $env:USERPROFILE\UserRights.inf -Force -WhatIf:$false
        Remove-Item $env:USERPROFILE\new.inf -Force -WhatIf:$false
    }
}
