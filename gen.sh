# USAGE: gen.sh PATH(s)
# PATH: project path which contains a proto directory and
#   a .proto named after the project (eg: blog, blog.proto)

argc=$#
argv=("$@")

for (( j = 0; j < argc; ++j )); do
  grpc_tools_node_protoc -I=${argv[j]}/proto/                                   \
    --js_out=import_style=commonjs:${argv[j]}/proto/                            \
    --grpc_out=grpc_js:${argv[j]}/proto/                                        \
    --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin  \
    ${argv[j]}/proto/${argv[j]}.proto;
  grpc_tools_node_protoc -I=${argv[j]}/proto/                                   \
    --js_out=import_style=commonjs:${argv[j]}/proto/                            \
    $(find ${argv[j]}/proto/ -type f -name "*.proto" -not -path "${argv[j]}/proto/${argv[j]}.proto")
done

