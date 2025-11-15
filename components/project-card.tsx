"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Star, Eye } from "lucide-react"

interface ProjectCardProps {
  project: {
    id: number
    title: string
    description: string
    members: number
    skills: string[]
    status: string
    image: string
    rating?: number
    views?: number
    featured?: boolean
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/project/${project.id}`)
  }

  return (
    <Card
      className="bg-card border-border overflow-hidden hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-card to-background">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>

        {project.featured && (
          <div className="absolute top-2 left-2 bg-accent/90 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur px-2 py-1 rounded-full text-xs">
          <Eye className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">{project.views}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{project.title}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2 transition-colors duration-300 ${
              project.status === "active" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"
            }`}
          >
            {project.status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

        {project.rating && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(project.rating!) ? "fill-accent text-accent" : "text-muted-foreground"}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{project.rating}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-4">
          {project.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="text-xs bg-background px-2 py-1 rounded text-muted-foreground hover:bg-accent/10 transition-colors duration-300"
            >
              {skill}
            </span>
          ))}
          {project.skills.length > 2 && (
            <span className="text-xs bg-background px-2 py-1 rounded text-muted-foreground">
              +{project.skills.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {project.members} members
          </div>
          <Button
            size="sm"
            className="gradient-primary text-white border-0 text-xs hover:shadow-md hover:shadow-accent/50 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            Join
          </Button>
        </div>
      </div>
    </Card>
  )
}
