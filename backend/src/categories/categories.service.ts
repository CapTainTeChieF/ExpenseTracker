import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto, RenameCategoryDto } from './category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  private cleanName(name: string): string {
    const trimmed = name.trim().replace(/\s+/g, ' ');
    if (trimmed.length < 2 || trimmed.length > 60) {
      throw new BadRequestException('Category name must contain 2–60 characters');
    }
    return trimmed;
  }

  private convertConflict(error: unknown): never {
    if ((error as {code?: string}).code === '23505') {
      throw new ConflictException('A category with this name already exists');
    }
    throw error;
  }

  async list(userId: string) {
    const result = await this.db.pool.query(
      `SELECT id, name, kind FROM categories WHERE user_id=$1 ORDER BY kind, name`,
      [userId],
    );
    return result.rows;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const name = this.cleanName(dto.name);
    try {
      const result = await this.db.pool.query(
        `INSERT INTO categories (user_id, name, kind)
         VALUES ($1,$2,$3) RETURNING id, name, kind`,
        [userId, name, dto.kind],
      );
      return result.rows[0];
    } catch (error) { this.convertConflict(error); }
  }

  async rename(userId: string, categoryId: string, dto: RenameCategoryDto) {
    const name = this.cleanName(dto.name);
    try {
      const result = await this.db.pool.query(
        `UPDATE categories SET name=$1 WHERE id=$2 AND user_id=$3
         RETURNING id,name,kind`,
        [name, categoryId, userId],
      );
      if (!result.rowCount) throw new NotFoundException('Category not found');
      return result.rows[0];
    } catch (error) { this.convertConflict(error); }
  }

  async remove(userId: string, categoryId: string) {
    // FK restriction preserves historical transactions and category references.
    try {
      const result = await this.db.pool.query(
        `DELETE FROM categories c
         WHERE c.id=$1 AND c.user_id=$2
           AND NOT EXISTS (SELECT 1 FROM transactions t WHERE t.category_id=c.id)
         RETURNING c.id`,
        [categoryId, userId],
      );
      if (result.rowCount) return {deleted: true};

      const existing = await this.db.pool.query(
        `SELECT 1 FROM categories WHERE id=$1 AND user_id=$2`,
        [categoryId, userId],
      );
      if (!existing.rowCount) throw new NotFoundException('Category not found');
      throw new ConflictException('Category is used by transactions; reassign them before deleting');
    } catch (error) {
      if ((error as {code?: string}).code === '23503') {
        throw new ConflictException('Category is used by transactions; reassign them before deleting');
      }
      throw error;
    }
  }
}
