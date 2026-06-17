#!/bin/bash
BUCKET="cruz-azul-erp-backups-2026"
ENDPOINT_RDS="cruzazul-db.c27god8ni5i4.us-east-1.rds.amazonaws.com"
FECHA=$(date +%Y-%m-%d_%H-%M-%S)
ARCHIVO="backup_farmacia_$FECHA.sql"

echo "1. Extrayendo Backup desde AWS RDS..."
docker run --rm -e PGPASSWORD="kick1234" postgres pg_dump -h $ENDPOINT_RDS -U postgres -F c -d postgres > /tmp/$ARCHIVO

echo "2. Subiendo a AWS S3 usando permisos nativos LabRole..."
aws s3 cp /tmp/$ARCHIVO s3://$BUCKET/$ARCHIVO

echo "3. Limpiando temporal..."
rm /tmp/$ARCHIVO
echo "Backup Exitoso"
