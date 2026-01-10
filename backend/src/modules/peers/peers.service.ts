import { Injectable } from '@nestjs/common';

@Injectable()
export class PeersService {
  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return null;
  }

  async create(createPeerDto: any) {
    return null;
  }

  async update(id: string, updatePeerDto: any) {
    return null;
  }

  async remove(id: string) {
    return null;
  }
}