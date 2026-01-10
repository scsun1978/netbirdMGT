import { Test, TestingModule } from '@nestjs/testing';
import { AlertRulesEngine } from '../rules-engine.service';
import { Repository } from 'typeorm';
import { AlertRule } from '../../entities/alert-rule.entity';
import { Alert } from '../../entities/alert.entity';
import { NbPeer } from '../../entities/nb-peer.entity';
import { NbGroup } from '../../entities/nb-group.entity';

describe('AlertRulesEngine', () => {
  let service: AlertRulesEngine;
  let alertRuleRepository: Repository<AlertRule>;
  let alertRepository: Repository<Alert>;
  let peerRepository: Repository<NbPeer>;
  let groupRepository: Repository<NbGroup>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertRulesEngine,
        {
          provide: 'AlertRuleRepository',
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'AlertRepository',
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'NbPeerRepository',
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: 'NbGroupRepository',
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlertRulesEngine>(AlertRulesEngine);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should evaluate enabled rules', async () => {
    const mockRules = [
      {
        id: 'rule-1',
        name: 'Test Rule',
        ruleType: 'peer_offline',
        isEnabled: true,
        conditions: {},
      },
    ];

    jest.spyOn(alertRuleRepository, 'find').mockResolvedValue(mockRules);

    const result = await service.evaluateRules();

    expect(result).toBeDefined();
    expect(alertRuleRepository.find).toHaveBeenCalledWith({
      where: { isEnabled: true },
    });
  });
});