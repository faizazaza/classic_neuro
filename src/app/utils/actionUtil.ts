//should probably type this better :))))
export const removeSchemaTag = (schema: any) => {
    try {
        delete schema["$schema"]
        return schema;
    } catch (error) {
        console.error("Failed to remove $schema tag")
    }
}