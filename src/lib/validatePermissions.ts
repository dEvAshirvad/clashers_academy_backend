export enum Permissions {
    READ = "read",
    WRITE = "write",
    UPDATE = "update",
    DELETE = "delete",
    ADMIN = "admin"
}

export default function validatePermission(permission: string): boolean {
    const [resource, perm] = permission.split(':');
    return !!resource && Object.values(Permissions).includes(perm as Permissions);
}