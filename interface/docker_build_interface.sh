docker build -t adage-server/docker-interface-base -f Dockerfile.base .

docker build -t adage-server/docker-interface-build -f Dockerfile .

# Set up mounting volume directory for bin and build folder if it does
# not already exist
script_directory=`dirname "${BASH_SOURCE[0]}"  | xargs realpath`
compile_folder="$script_directory/compile_folder"

if [ ! -d "$compile_folder" ]; then
    mkdir $compile_folder
    chmod 775 $compile_folder
fi

docker run \
      --volume $compile_folder:/home/user/compile_folder \
      adage-server/docker-interface-build

mv $compile_folder/bin .
mv $compile_folder/build .

rmdir $compile_folder
