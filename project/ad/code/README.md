# Vulnerable AD
### Creating vulnerable AD configuration by: Generating Users, Groups and DC local admins from JSON schema file, as well as Weakening Password Policies:

```
.\gen_ad.ps1 .\ad_schema.json
```

*To undo changes run: `.\gen_ad.ps1 .\ad_schema.json -Undo`*

> *Notice the difference between local administrators vs. Global administrators. **Local accounts with administrator privileges** are considered necessary to be able to run system updates, software upgrades, and hardware usage. Assign the **Global admin** role to users who need global access to most management features and data across Microsoft online services. Only global admins can: Reset passwords for all users. Add and manage domains.*

### Creating Random JSON schema file:

```
.\random_domain.ps1 ad_schema.json -UserCount 12 -GroupCount 4 -LocalAdminCount 1
```

> Refs: \
> https://madlabber.wordpress.com/2019/09/08/creating-a-new-active-directory-forest-with-ansible/
> https://www.youtube.com/watch?v=66ZD1J-AR2c&list=PL1H1sBF1VAKVoU6Q2u7BBGPsnkn-rajlp
> https://github.com/WazeHell/vulnerable-AD
