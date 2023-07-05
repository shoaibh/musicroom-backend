import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ValidationError } from 'class-validator/types/validation/ValidationError';
import { validate } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  FindOptionsWhere,
  FindManyOptions,
} from 'typeorm/index';
import moment from 'moment';

export declare type Diff<
  T extends string | symbol | number,
  U extends string | symbol | number,
> = ({
  [P in T]: P;
} & {
  [P in U]: never;
} & {
  [x: string]: never;
})[T];
export declare type Omit<T, K extends keyof T> = {
  [P in Diff<keyof T, K>]: T[P];
};
export declare type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
export declare type NonAbstract<T> = {
  [P in keyof T]: T[P];
};

export type FilteredModelAttributes<T extends ModelEntity<T>> =
  RecursivePartial<Omit<T, keyof ModelEntity<any>>> & {
    // id?: number | any;
    createdAt?: Date | any;
    updatedAt?: Date | any;
    deletedAt?: Date | any;
    version?: number | any;
  };

export const toNumberTransformer = {
  to: (entityValue: string) => {
    return entityValue;
  },
  from: (databaseValue: string | null | undefined) => {
    if (
      databaseValue === null ||
      databaseValue === undefined ||
      databaseValue === ''
    )
      return null;
    else return Number(databaseValue);
  },
};

export const toDateTransformer = {
  to: (entityValue: string) => {
    return entityValue;
  },
  from: (databaseValue: string | null | undefined) => {
    if (
      databaseValue === null ||
      databaseValue === undefined ||
      databaseValue === ''
    )
      return null;
    else return moment(databaseValue).toDate();
  },
};

export default class ModelEntity<T extends ModelEntity<T>> extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  _score?: number; // to be used with ES Objects

  constructor(values?: FilteredModelAttributes<T>) {
    super();
    Object.assign<{}, FilteredModelAttributes<T>>(this, values);
  }

  validate(): Promise<ValidationError[]> {
    return validate(this);
  }

  @BeforeUpdate()
  @BeforeInsert()
  beforeUpdate() {
    this.updatedAt = new Date();
  }

  public static fetchWithBaseCondition<T>(
    options: FindManyOptions<T>,
    baseConditions: FindOptionsWhere<T>,
  ): FindManyOptions<T> {
    if (options.where) {
      if (Array.isArray(options.where)) {
        options.where = options.where.map((condition) =>
          Object.assign({}, condition, baseConditions),
        );
      } else if (typeof options.where === 'object') {
        options.where = Object.assign({}, options.where, baseConditions);
      }
    } else {
      options.where = baseConditions;
    }
    return options;
  }

  public toJSON({
    includes = [],
    skips = ['createdAt', 'updatedAt'],
  }: {
    includes?: (keyof T)[];
    skips?: string[];
  }): Partial<T> {
    const d: Partial<T> = {};
    for (const key of includes) {
      // @ts-ignore
      d[key] = this[key];
    }

    for (const key of skips) {
      delete d[key];
    }
    // @ts-ignore
    d.id = this.id;
    return d;
  }
}
