"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Code2,
  Sparkles,
  Plus,
  Search,
  Filter,
  Play,
  Copy,
  Star,
  Check,
  Clock,
  Tag,
  Folder,
  FileText,
  Share2,
  Download,
  Trash2,
  Edit3,
  Eye,
  Users,
  Bot,
  Database,
  ShieldCheck,
  Zap,
  BarChart3,
  Wand2,
  FileCode,
  Layers,
  Terminal,
  Server,
  Globe,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  RefreshCw,
  Upload,
  Activity,
  Sliders,
  ChevronDown,
  Bookmark,
  Smartphone,
  Box,
  Cloud,
  GitBranch,
  TestTube,
  TestTubes,
  FileJson,
  History,
  Save,
} from "lucide-react"

export default function CodeStudioPage() {
  const router = useRouter()

  // Navigation & Category Tab State (14 Tabs)
  const [activeTab, setActiveTab] = useState<
    | "frontend"
    | "backend"
    | "mobile"
    | "database"
    | "devops"
    | "docker"
    | "kubernetes"
    | "terraform"
    | "github"
    | "unittests"
    | "integrationtests"
    | "history"
    | "templates"
  >("frontend")

  // Code Generation Config State
  const [selectedLanguage, setSelectedLanguage] = useState("TypeScript")
  const [selectedFramework, setSelectedFramework] = useState("Next.js 15 (App Router)")
  const [selectedModel, setSelectedModel] = useState("Claude 3.5 Sonnet")
  const [promptInput, setPromptInput] = useState(
    "Create a production-ready Next.js 15 Server Action & Client Hook for an HNSW Vector Database Search endpoint with optimistic UI updates and zero-latency caching."
  )

  // Live Generator & Preview State
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Active Code File Preview State
  const [activeFileName, setActiveFileName] = useState("vectorSearch.ts")

  // Sample Code Snippets for Live Preview by Tab
  const codeSnippets: Record<string, { fileName: string; code: string; stats: { lines: number; tokens: string; time: string } }> = {
    frontend: {
      fileName: "DashboardStatsCard.tsx",
      stats: { lines: 142, tokens: "1.8k", time: "0.8s" },
      code: `"use client"

import * as React from "react"
import { useOptimistic, useTransition } from "react"
import { Sparkles, TrendingUp, ArrowUpRight } from "lucide-react"

interface StatsProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
}

export function AIStatCard({ title, value, change, trend }: StatsProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticValue, setOptimisticValue] = useOptimistic(value)

  const handleRefresh = () => {
    startTransition(async () => {
      setOptimisticValue("Calculating...")
      // Simulated server action call
      const res = await fetch("/api/v1/metrics/refresh", { method: "POST" })
      const data = await res.json()
      setOptimisticValue(data.updatedValue)
    })
  }

  return (
    <div className="p-5 bg-[#141620]/90 backdrop-blur-xl border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-xl hover:border-purple-500/50 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{optimisticValue}</h3>
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" /> {change}
        </span>
      </div>

      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="w-full mt-2 py-2 bg-[#181a26] hover:bg-purple-600 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all border border-[#2d3248] flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>Refresh Live Metrics</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}`,
    },
    backend: {
      fileName: "vector_search.rs",
      stats: { lines: 186, tokens: "2.4k", time: "1.1s" },
      code: `use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VectorPayload {
    pub id: u64,
    pub embedding: Vec<f32>,
    pub metadata: std::collections::HashMap<String, String>,
}

pub struct DistributedHNSWIndex {
    pub dimension: usize,
    pub nodes: Arc<RwLock<Vec<VectorPayload>>>,
}

impl DistributedHNSWIndex {
    pub fn new(dimension: usize) -> Self {
        Self {
            dimension,
            nodes: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn search_knn(&self, query: &[f32], k: usize) -> Vec<(u64, f32)> {
        let nodes = self.nodes.read().await;
        let mut results: Vec<(u64, f32)> = nodes.iter().map(|n| {
            let score = cosine_similarity(query, &n.embedding);
            (n.id, score)
        }).collect();

        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        results.truncate(k);
        results
    }
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    dot / (norm_a * norm_b + 1e-8)
}`,
    },
    docker: {
      fileName: "Dockerfile.prod",
      stats: { lines: 48, tokens: "650", time: "0.4s" },
      code: `# Multi-stage high performance Dockerfile for Next.js 15
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-libc6-compat

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]`,
    },
    kubernetes: {
      fileName: "deployment.yaml",
      stats: { lines: 62, tokens: "890", time: "0.5s" },
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: forgeai-vector-engine
  namespace: production
  labels:
    app: vector-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vector-engine
  template:
    metadata:
      labels:
        app: vector-engine
    spec:
      containers:
      - name: engine
        image: forgeai/vector-engine:latest
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "4.0"
            memory: "8Gi"
          requests:
            cpu: "1.0"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10`,
    },
    terraform: {
      fileName: "main.tf",
      stats: { lines: 95, tokens: "1.4k", time: "0.7s" },
      code: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "forgeai-prod-vpc"
  cidr   = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false
}`,
    },
    database: {
      fileName: "schema.prisma",
      stats: { lines: 74, tokens: "1.1k", time: "0.6s" },
      code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  projects  Project[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  createdAt   DateTime @default(now())
}

enum Role {
  USER
  ADMIN
  ENTERPRISE
}`,
    },
  }

  // Active Code Snippet Fallback
  const activeCodeObj = codeSnippets[activeTab] || codeSnippets.frontend

  // Handle Live AI Generation
  const handleGenerateCode = () => {
    setIsGenerating(true)
    setToastMessage("⚡ AI Agent is compiling production-ready code with AST syntax checks...")

    setTimeout(() => {
      setIsGenerating(false)
      setToastMessage("✅ Production code generated & validated cleanly!")
      setTimeout(() => setToastMessage(null), 3500)
    }, 1500)
  }

  // Handle Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeObj.code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI Code Generator Studio</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate production-ready code, infrastructure, tests and deployment files using AI.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleGenerateCode}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-white" />
            <span>+ Generate Code</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Project</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Template</span>
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14 TOP NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 custom-scrollbar text-xs font-semibold">
          {[
            { id: "frontend", label: "Frontend", icon: Code2 },
            { id: "backend", label: "Backend", icon: Server },
            { id: "mobile", label: "Mobile", icon: Smartphone },
            { id: "database", label: "Database", icon: Database },
            { id: "devops", label: "DevOps", icon: Cpu },
            { id: "docker", label: "Docker", icon: Box },
            { id: "kubernetes", label: "Kubernetes", icon: Layers },
            { id: "terraform", label: "Terraform", icon: Cloud },
            { id: "github", label: "GitHub Actions", icon: GitBranch },
            { id: "unittests", label: "Unit Tests", icon: TestTube },
            { id: "integrationtests", label: "Integration Tests", icon: TestTubes },
            { id: "history", label: "Code History", icon: History },
            { id: "templates", label: "Templates", icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white hover:bg-[#1c1f2e]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS: INPUT WIZARD & LIVE CODE PREVIEW) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* AI PROMPT INPUT & FRAMEWORK SELECTOR */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-xs">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pb-3 border-b border-[#232736]">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-purple-400" /> AI Code Prompt
                </span>
              </div>

              {/* Selectors */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer font-medium"
                >
                  <option>Next.js 15 (App Router)</option>
                  <option>React 19 + Tailwind</option>
                  <option>Node.js Express / NestJS</option>
                  <option>Python FastAPI</option>
                  <option>Rust Tokio</option>
                  <option>Docker Multi-stage</option>
                  <option>Kubernetes Helm</option>
                  <option>Terraform AWS</option>
                </select>

                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer font-medium"
                >
                  <option>TypeScript</option>
                  <option>Rust</option>
                  <option>Python</option>
                  <option>Go</option>
                  <option>YAML</option>
                  <option>SQL</option>
                  <option>HCL (Terraform)</option>
                </select>
              </div>
            </div>

            {/* Prompt Textarea */}
            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Describe the code, API endpoint, component or infrastructure script you want to generate..."
              className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />

            {/* Quick Preset Badges */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
              <span className="font-semibold text-slate-500">Popular Presets:</span>
              {[
                "Next.js Dashboard",
                "REST API Endpoint",
                "PostgreSQL ER Schema",
                "Dockerfile Multi-Stage",
                "Kubernetes Ingress",
                "Jest Unit Test Suite",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptInput(`Generate a production ${preset} with error handling & type safety.`)}
                  className="px-2.5 py-1 rounded-lg bg-[#181a26] hover:bg-purple-600 text-slate-300 hover:text-white border border-[#2d3248] transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Generate Button */}
            <button
              disabled={isGenerating}
              onClick={handleGenerateCode}
              className="mt-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Compiling & Validating Production Code...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white" />
                  <span>⚡ Generate Production Code with AI</span>
                </>
              )}
            </button>
          </div>

          {/* ========================================================================= */}
          {/* LIVE CODE PREVIEW CANVAS */}
          {/* ========================================================================= */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Code Window Header */}
            <div className="bg-[#0d0e14] px-4 py-3 border-b border-[#232736] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#161824] border border-[#262a3c] font-mono text-purple-300 font-bold flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  {activeCodeObj.fileName}
                </span>
              </div>

              {/* Code Actions Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-purple-600 text-slate-300 hover:text-white border border-[#2d3248] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold"><Check className="w-3.5 h-3.5" /> Copied!</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy Code</span>
                  )}
                </button>

                <button className="px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-blue-600 text-slate-300 hover:text-white border border-[#2d3248] transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-blue-400" /> Download File
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 bg-[#0a0b10] overflow-x-auto font-mono text-xs leading-relaxed text-slate-200 custom-scrollbar">
              <pre className="p-2">
                <code>{activeCodeObj.code}</code>
              </pre>
            </div>

            {/* Code Footer Telemetry */}
            <div className="bg-[#0d0e14] px-4 py-2 border-t border-[#232736] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span>Lines: <strong className="text-white">{activeCodeObj.stats.lines}</strong></span>
                <span>Tokens: <strong className="text-purple-400">{activeCodeObj.stats.tokens}</strong></span>
                <span>Gen Speed: <strong className="text-emerald-400">{activeCodeObj.stats.time}</strong></span>
              </div>
              <span className="text-purple-300">Target: Production Ready</span>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (STATISTICS & QUICK SHORTCUTS) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Generation Statistics */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-purple-400" /> Code Generation Stats</span>
              <span className="text-[10px] text-emerald-400 font-mono">Live</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Lines Generated:</span>
                <span className="text-white font-bold">{activeCodeObj.stats.lines} lines</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Estimated Tokens:</span>
                <span className="text-purple-400 font-bold">{activeCodeObj.stats.tokens}</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Framework:</span>
                <span className="text-blue-400 font-bold">{selectedFramework.split(" ")[0]}</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">AI Model:</span>
                <span className="text-emerald-400 font-bold">{selectedModel}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts Grid */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Actions</span>
              <span className="text-[10px] text-slate-400 font-mono">Shortcuts</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { name: "Generate Full Stack App", icon: Code2 },
                { name: "Generate Authentication", icon: ShieldCheck },
                { name: "Generate Admin Dashboard", icon: BarChart3 },
                { name: "Generate REST API", icon: Server },
                { name: "Generate Docker Setup", icon: Box },
                { name: "Generate Kubernetes Helm", icon: Layers },
                { name: "Generate CI/CD Workflow", icon: GitBranch },
              ].map((qa, idx) => {
                const Icon = qa.icon
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptInput(`Generate a complete ${qa.name} boilerplate with type definitions & docs.`)
                      handleGenerateCode()
                    }}
                    className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center gap-2 transition-all text-left cursor-pointer font-semibold"
                  >
                    <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{qa.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
