import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { SpecializationService } from './specialization.service';
import { Public } from '../auth/public.decorator';
import { SpecializationBranch } from '@prisma/client';

@Public()
@Controller('specializations')
export class SpecializationController {
  constructor(private specializationService: SpecializationService) {}

  @Get(':class/branches')
  async getAvailableBranches(@Param('class') characterClass: string) {
    const branches = await this.specializationService.getAvailableBranches(characterClass);
    return { branches };
  }

  @Get('character/:characterId')
  async getCharacterSpecialization(@Param('characterId', ParseIntPipe) characterId: number) {
    const specialization = await this.specializationService.getCharacterSpecialization(characterId);
    return { specialization };
  }

  @Get('branch/:branch/abilities')
  async getBranchAbilities(@Param('branch') branch: SpecializationBranch) {
    const abilities = await this.specializationService.getBranchAbilities(branch);
    return { abilities };
  }

  @Post('choose')
  async chooseBranch(
    @Body() body: { characterId: number; branch: SpecializationBranch },
  ) {
    const specialization = await this.specializationService.chooseBranch(
      body.characterId,
      body.branch,
    );
    return { specialization };
  }

  @Post('change')
  async changeBranch(
    @Body() body: { characterId: number; newBranch: SpecializationBranch },
  ) {
    const specialization = await this.specializationService.changeBranch(
      body.characterId,
      body.newBranch,
    );
    return { specialization, message: 'Специализация изменена за 1000 золота' };
  }

  @Post('unlock-tier')
  async unlockTier(@Body() body: { characterId: number }) {
    const specialization = await this.specializationService.unlockTier(body.characterId);
    return { specialization, message: 'Следующий тир разблокирован!' };
  }
}
