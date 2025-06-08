'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Briefcase, Clock, MapPin, DollarSign, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: number;
    type: string;
    duration: string;
    experience: string;
    location?: string;
    skills: string[];
    createdAt: string;
    user: {
      id: string;
      name: string;
      image: string | null;
      companyName?: string;
    };
    _count: {
      proposals: number;
    };
  };
}

export function JobCard({ job }: JobCardProps) {
  const {
    id,
    title,
    description,
    budget,
    type,
    duration,
    experience,
    location,
    skills,
    createdAt,
    user,
    _count,
  } = job;

  return (
    <Card
      as="article"
      variant="default"
      interactive
      className="group transition-all duration-200"
    >
      <Link href={`/vagas/${id}`} className="block">
        <div className="flex items-start gap-4 p-6">
          {/* Logo da empresa */}
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.companyName || user.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Briefcase className="w-6 h-6 text-primary-600" />
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 truncate">
                  {title}
                </h2>
                <p className="text-sm text-secondary-600">
                  {user.companyName || user.name}
                </p>
              </div>
              <div className="shrink-0">
                <Badge variant="success" size="sm">
                  R$ {budget.toLocaleString('pt-BR')}
                </Badge>
              </div>
            </div>

            <p className="mt-2 text-secondary-600 line-clamp-2">{description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" size="sm">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{skills.length - 3}
                </Badge>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-secondary-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{experience}</span>
              </div>
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-secondary-100 pt-4">
              <div className="flex items-center gap-2 text-sm text-secondary-500">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{type}</span>
                </div>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" size="sm">
                  {_count.proposals} {_count.proposals === 1 ? 'proposta' : 'propostas'}
                </Badge>
                <Button variant="primary" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
} 