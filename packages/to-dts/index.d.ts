export = toDts;

/**
 * @param specification
 * @param config
 */
declare function toDts(specification: object, config?: {
    umd?: string;
    export?: 'named' | 'exports' | 'default';
}): string;

