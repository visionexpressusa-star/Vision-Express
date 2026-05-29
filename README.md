- Run Mysql docker command to create the MySQL Container:

`docker run --name ve-internal-db-mysql \
-v /Users/aliasad/Development/mysql-data/ve-internal-db:/etc/mysql/conf.d \
-e MYSQL_ROOT_PASSWORD=passw0rd1+ \
-p 3306:3306 \
-d mysql:8.0`

- Connect to the mysql and create the database using following script:

`create database veInternalDb;`

