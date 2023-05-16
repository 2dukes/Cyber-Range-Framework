# Build Jail image
docker build -t kali_test .

# Login DockerHub

# Publish Image in DockerHub
docker tag kali_test:latest 2dukes/kali_test_img

docker push 2dukes/kali_test_img
