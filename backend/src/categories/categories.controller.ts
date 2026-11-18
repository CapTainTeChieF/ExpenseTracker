import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreateCategoryDto, RenameCategoryDto } from './category.dto';
import { CategoriesService } from './categories.service';
import { ApiCreatedResponse, ApiOkResponse, ApiConflictResponse } from '@nestjs/swagger';
import { CategoryView } from '../api-docs/response.models';

@ApiTags('Categories')
@ApiCookieAuth('expense_session')
@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @ApiOperation({summary:'List own categories'})
  @ApiOkResponse({type:[CategoryView]})
  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.categories.list(req.user.id);
  }

  @ApiOperation({summary:'Create category'})
  @ApiCreatedResponse({type:CategoryView})
  @ApiConflictResponse({description:'Category name already exists for this user and type'})
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateCategoryDto) {
    return this.categories.create(req.user.id, dto);
  }

  @ApiOperation({summary:'Rename own category'})
  @ApiOkResponse({type:CategoryView})
  @Patch(':id')
  rename(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RenameCategoryDto,
  ) {
    return this.categories.rename(req.user.id, id, dto);
  }

  @ApiOperation({summary:'Delete unused category (409 if referenced)'})
  @ApiConflictResponse({description:'Category is still used by a transaction'})
  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.categories.remove(req.user.id, id);
  }
}
