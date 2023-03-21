#!/bin/bash
# USAGE: gen.sh PATH(s)
# PATH: project path which contains a proto directory and
#   a .proto named after the project (eg: blog, blog.proto)
#   and optionally some other .proto files

argc=$#
argv=("$@")

for (( j = 0; j < argc; ++j )); do
  # Generate gRPC and Protobuf code for ${PROJECT}/${PROJECT}.proto
  # (eg: greet/greet.proto)
  ./node_modules/.bin/grpc_tools_node_protoc -I ${argv[j]}/proto/                                   \
    --js_out=import_style=commonjs:${argv[j]}/proto/                            \
    --grpc_out=grpc_js:${argv[j]}/proto/                                        \
    ${argv[j]}/proto/${argv[j]}.proto;

  # Generate only Protobuf code for all the other .proto files (if any)
  # (eg: calculator/sum.proto)
  ./node_modules/.bin/grpc_tools_node_protoc -I ${argv[j]}/proto/                                   \
    --js_out=import_style=commonjs:${argv[j]}/proto/                            \
    $(find ${argv[j]}/proto/ -type f -name "*.proto" -not -path "${argv[j]}/proto/${argv[j]}.proto")
done