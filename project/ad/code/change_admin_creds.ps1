# Refs:
# https://blog.techinline.com/2018/12/20/how-to-change-windows-password-using-command-line-or-powershell/

# Change Security Credential for Admin Accounts (Administrator, vagrant)
$new_password = "completeSecurePassw0rd"

Set-ADAccountPassword -Identity "Administrator" -Reset -NewPassword (ConvertTo-SecureString -AsPlainText "$new_password" -Force)
Set-ADAccountPassword -Identity "vagrant" -Reset -NewPassword (ConvertTo-SecureString -AsPlainText "$new_password" -Force)
