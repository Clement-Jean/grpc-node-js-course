foreach ( $project in $args ) {
    # Generate gRPC and Protobuf code for ${PROJECT}/${PROJECT}.proto
    # (eg: greet/greet.proto)
    ./node_modules/.bin/grpc_tools_node_protoc -I $project\proto                                       `
    --js_out=import_style=commonjs:$project\proto                                  `
    --grpc_out=grpc_js:$project\proto                                              `
    $project\proto\$project.proto;
    
    # Generate only Protobuf code for all the other .proto files (if any)
    # (eg: calculator/sum.proto)
    Get-ChildItem -Filter *.proto -Recurse $project\proto -Exclude $project.proto | ForEach-Object { `
        $file = ".\$project\proto\" + $_.Name;                                  `
        ./node_modules/.bin/grpc_tools_node_protoc -I $project\proto                                    `
        --js_out=import_style=commonjs:$project\proto                               `
        $file `
    }
}