export default function getEnumValues<T extends object>(enumObj: T): string[] {
    return Object.values(enumObj) as string[];
}