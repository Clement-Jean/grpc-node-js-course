foreach ( $project in $args ) {
    ./node_modules/.bin/grpc_tools_node_protoc -I $project\proto                                       `
    --js_out=import_style=commonjs:$project\proto                                  `
    --grpc_out=grpc_js:$project\proto                                              `
    $project\proto\$project.proto;
    Get-ChildItem -Filter *.proto -Recurse $project\proto -Exclude $project.proto | ForEach-Object { `
        $file = ".\$project\proto\" + $_.Name;                                  `
        ./node_modules/.bin/grpc_tools_node_protoc -I $project\proto                                    `
        --js_out=import_style=commonjs:$project\proto                               `
        $file `
    }
}